#!/bin/bash

# ============================================================================
# CODEX DEVELOPMENT STARTUP SCRIPT
# ============================================================================
#
# This script starts the Codex development environment with:
# - Metro Bundler on port 8091
# - QR code for physical device testing
# - Tunnel mode for remote access
# - Auto-starts Android emulator if needed
# - Sets up port forwarding for Android (port 8091)
#
# Port Configuration:
# - Metro Bundler: 8091 (vs Kallax on 8081)
# - Web Server: 8092 (vs Kallax on 8082)
#
# Usage:
#   npm run dev          # Start with tunnel (QR code for physical devices)
#   npm run dev:local    # Start in LAN mode (faster, same network only)
#
# ============================================================================

set -e

# Only allow in development
if [ "${NODE_ENV}" = "production" ]; then
  echo "❌ Error: This script is for development only!"
  echo "   Production builds should use: expo build or eas build"
  exit 1
fi

# Determine connection mode (tunnel by default for QR codes)
CONNECTION_MODE="${1:---tunnel}"

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
# PHASE 3: Start Development Server
# ============================================================================

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Codex development environment ready!"
echo ""

if [ "$ANDROID_AVAILABLE" = true ]; then
  echo "🤖 Android Emulator: Connected (port 8091)"
fi

echo ""
echo "📋 Metro Bundler: http://localhost:8091"
echo "🌐 Web Preview: http://localhost:8092"
echo ""
echo "📱 Physical Device Testing:"
echo "   Scan the QR code below with Expo Go app"
echo "   (Installing Expo Go from App Store/Play Store)"
echo ""
echo "💡 Can run alongside Kallax (port 8081) without conflicts!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🚀 Starting Expo with QR code..."
echo ""

# Start Expo with tunnel mode for QR codes and physical devices
exec npx expo start --port 8091 --clear $CONNECTION_MODE
