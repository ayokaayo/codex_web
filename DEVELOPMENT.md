# Codex Development Guide

## Quick Start

### Start with QR Code (for physical devices)
```bash
npm run dev
```
This starts the dev server in **tunnel mode** with a QR code you can scan with your phone.

### Start in LAN Mode (faster, same network only)
```bash
npm run dev:local
```
Faster startup, but only works if your computer and phone are on the same WiFi network.

## Physical Device Testing

1. Install **Expo Go** app on your phone:
   - iOS: Download from App Store
   - Android: Download from Play Store

2. Run `npm run dev` in your terminal

3. Scan the QR code that appears with:
   - iOS: Camera app or Expo Go app
   - Android: Expo Go app

4. Your app will load on your physical device!

## Running Alongside Kallax

Codex uses port **8091** (Kallax uses 8081), so you can run both projects simultaneously:

**Terminal 1:**
```bash
cd /Users/exotica/code/kallax
npm run dev
```

**Terminal 2:**
```bash
cd /Users/exotica/code/codex
npm run dev
```

## Port Configuration

- **Metro Bundler:** http://localhost:8091
- **Web Preview:** http://localhost:8092
- **QR Code/Dev Tools:** http://localhost:8091

## Configuration

- **Scheme:** `codex://` (for deep linking)
- **iOS Bundle ID:** `com.codex.app`
- **Android Package:** `com.codex.app`
- **New Architecture:** Enabled (required for React Native Reanimated 4.x)

## Environment Setup

Copy `.env.example` to `.env` and fill in your keys:
- Supabase URL and API key
- RevenueCat API key

## Notes

- First build takes 2-3 minutes
- Subsequent hot reloads are instant
- Use tunnel mode for remote testing (slower but works anywhere)
- Use LAN mode for local testing (faster but requires same network)
