#!/bin/bash

# ============================================================================
# CODEX SMART DEVELOPMENT STARTUP SCRIPT
# ============================================================================
#
# This script intelligently starts the development environment:
# - Auto-builds apps on first run
# - Instant startup on subsequent runs (2-3 seconds)
# - Auto-starts Android emulator if needed
# - Sets up port forwarding for Android (port 8091)
# - Opens both iOS and Android automatically
#
# Port Configuration:
# - Metro Bundler: 8091 (vs Kallax on 8081)
# - Web Server: 8092 (vs Kallax on 8082)
#
# ============================================================================

set -e

# Only allow in development
if [ "${NODE_ENV}" = "production" ]; then
  echo "❌ Error: This script is for development only!"
  echo "   Production builds should use: expo build or eas build"
  exit 1
fi

echo "🚀 Starting Codex development environment..."
echo ""

# ============================================================================
# PHASE 1: Cleanup existing processes
# ============================================================================

echo "🧹 Cleaning up existing processes..."
pkill -f "expo start.*8091" 2>/dev/null || true
pkill -f "metro.*8091" 2>/dev/null || true
lsof -ti:8091 | xargs kill -9 2>/dev/null || true
lsof -ti:8092 | xargs kill -9 2>/dev/null || true
sleep 2

# ============================================================================
# PHASE 2: Android Emulator Setup
# ============================================================================

# Set Android SDK path (try common locations)
if [ -z "$ANDROID_HOME" ]; then
  if [ -d "$HOME/Library/Android/sdk" ]; then
    export ANDROID_HOME="$HOME/Library/Android/sdk"
  elif [ -d "/usr/local/android-sdk" ]; then
    export ANDROID_HOME="/usr/local/android-sdk"
  fi
fi

ANDROID_AVAILABLE=false
if [ -n "$ANDROID_HOME" ] && [ -d "$ANDROID_HOME" ]; then
  ANDROID_AVAILABLE=true

  echo "🤖 Checking Android emulator..."

  # Check if emulator is running
  if ! $ANDROID_HOME/platform-tools/adb devices 2>/dev/null | grep -q "emulator.*device"; then
    echo "   Starting Android emulator..."

    # Get first available AVD
    AVD_NAME=$($ANDROID_HOME/emulator/emulator -list-avds 2>/dev/null | head -n 1)

    if [ -z "$AVD_NAME" ]; then
      echo "   ⚠️  No Android emulators found. Skipping Android."
      ANDROID_AVAILABLE=false
    else
      # Start emulator in background
      $ANDROID_HOME/emulator/emulator -avd "$AVD_NAME" > /dev/null 2>&1 &

      # Wait for emulator to boot
      echo "   ⏳ Waiting for emulator to boot..."
      $ANDROID_HOME/platform-tools/adb wait-for-device 2>/dev/null
      sleep 5
      echo "   ✅ Emulator ready"
    fi
  else
    echo "   ✅ Emulator already running"
  fi

  # Critical: Set up port forwarding for Metro on port 8091
  if [ "$ANDROID_AVAILABLE" = true ]; then
    $ANDROID_HOME/platform-tools/adb reverse tcp:8091 tcp:8091 2>/dev/null || true
  fi
else
  echo "⚠️  Android SDK not found. Skipping Android."
fi

# ============================================================================
# PHASE 3: Detect Build Status
# ============================================================================

echo ""
echo "🔍 Checking build status..."

# Check if Android app is installed
ANDROID_BUILT=false
if [ "$ANDROID_AVAILABLE" = true ]; then
  if $ANDROID_HOME/platform-tools/adb shell pm list packages 2>/dev/null | grep -q "com.codex.app"; then
    ANDROID_BUILT=true
    echo "   ✅ Android app already built"
  else
    echo "   📦 Android app needs building (first time)"
  fi
fi

# Check if iOS app is built
IOS_BUILT=false
IOS_AVAILABLE=false
if [[ "$OSTYPE" == "darwin"* ]]; then
  IOS_AVAILABLE=true

  # Check if app exists in simulators
  if xcrun simctl list apps booted 2>/dev/null | grep -q "com.codex.app"; then
    IOS_BUILT=true
    echo "   ✅ iOS app already built"
  else
    echo "   📦 iOS app needs building (first time)"
  fi
fi

# ============================================================================
# PHASE 4: Start Metro Bundler
# ============================================================================

echo ""
echo "📦 Starting Metro Bundler on port 8091..."
npx expo start --port 8091 --clear > /tmp/codex-dev.log 2>&1 &
METRO_PID=$!

# Wait for Metro to be ready
echo "   ⏳ Waiting for Metro to initialize..."
sleep 8
echo "   ✅ Metro ready"

# ============================================================================
# PHASE 5: Launch Apps
# ============================================================================

echo ""
BUILD_NEEDED=false

# Launch Android
if [ "$ANDROID_AVAILABLE" = true ]; then
  if [ "$ANDROID_BUILT" = false ]; then
    echo "🔨 Building Android app (this will take ~2 minutes)..."
    BUILD_NEEDED=true
    npx expo run:android >> /tmp/codex-dev.log 2>&1 &
  else
    echo "🤖 Launching Android app..."
    $ANDROID_HOME/platform-tools/adb shell am force-stop com.codex.app 2>/dev/null || true
    sleep 1
    $ANDROID_HOME/platform-tools/adb shell monkey -p com.codex.app -c android.intent.category.LAUNCHER 1 > /dev/null 2>&1
    echo "   ✅ Android app launched"
  fi
fi

# Launch iOS
if [ "$IOS_AVAILABLE" = true ]; then
  if [ "$IOS_BUILT" = false ]; then
    echo "🔨 Building iOS app (this will take ~2 minutes)..."
    BUILD_NEEDED=true
    npx expo run:ios >> /tmp/codex-dev.log 2>&1 &
  else
    echo "🍎 Launching iOS app..."
    # Boot default simulator if not running
    xcrun simctl boot "iPhone" 2>/dev/null || true
    sleep 2
    # Launch the app
    xcrun simctl launch booted com.codex.app > /dev/null 2>&1 || true
    echo "   ✅ iOS app launched"
  fi
fi

# ============================================================================
# PHASE 6: User Feedback
# ============================================================================

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Codex development environment ready!"
echo ""

if [ "$BUILD_NEEDED" = true ]; then
  echo "   ⏳ First-time builds in progress..."
  echo "   This will take 2-3 minutes, then hot reload will be instant"
  echo ""
fi

if [ "$IOS_AVAILABLE" = true ]; then
  echo "📱 iOS Simulator: Connected"
fi

if [ "$ANDROID_AVAILABLE" = true ]; then
  echo "🤖 Android Emulator: Connected"
fi

echo "🔄 Hot Reload: Enabled"
echo ""
echo "📋 Metro: http://localhost:8091"
echo "🌐 Web: http://localhost:8092"
echo "📝 Logs: /tmp/codex-dev.log"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 Tip: Subsequent runs will start in 2-3 seconds!"
echo "💡 Can run alongside Kallax (port 8081) without conflicts!"
echo ""
echo "Press Ctrl+C to stop all processes"
echo ""

# Keep Metro running and handle Ctrl+C
trap "echo ''; echo '🛑 Stopping development environment...'; kill $METRO_PID 2>/dev/null || true; exit 0" INT TERM

# Wait for Metro process
wait $METRO_PID
