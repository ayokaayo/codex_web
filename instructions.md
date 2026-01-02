# CODEX TAROT — Complete Build Instructions

## PROJECT SUMMARY

**App**: Codex Tarot — A mobile Tarot de Marseille reading app  
**Platforms**: iOS (App Store) + Android (Google Play)  
**Revenue Model**: Freemium — 1-card free, 3/5-card paid  

**Tech Stack**:
- Expo SDK 52 (managed workflow, New Architecture DISABLED for stability)
- React Native 0.76.x
- Expo Router v4 (file-based routing)
- TypeScript (strict mode)
- NativeWind 4.x + Tailwind CSS 3.4.x
- Reanimated 3.x (NOT v4 — compatibility with NativeWind)
- Zustand (state management)
- Supabase (auth + edge functions)
- RevenueCat (payments — core SDK only, custom paywall UI)
- Claude API (via Supabase edge function)

**Fonts** (all from Google Fonts):
- Cinzel (brand/headings — replaces Goudy)
- Inter (UI/body)
- Cormorant Garamond (oracle/mystical text)

---

## PHASE 0: PROJECT INFRASTRUCTURE

This phase MUST be complete and validated before any feature work. Do not proceed until every checkbox passes.

### Step 0.1: Create Project

```bash
# Navigate to code directory
cd ~/code

# Create new Expo project with blank TypeScript template
npx create-expo-app@latest codex-tarot --template blank-typescript

# Enter project
cd codex-tarot

# Remove default App.tsx (we'll use Expo Router)
rm App.tsx
```

### Step 0.2: Install Dependencies

Run each command separately to catch errors:

```bash
# Core Expo packages
npx expo install expo-router expo-linking expo-constants expo-status-bar expo-splash-screen expo-font expo-image expo-linear-gradient expo-secure-store expo-haptics

# Navigation dependencies (required by expo-router)
npx expo install react-native-screens react-native-safe-area-context

# Animation
npx expo install react-native-reanimated@~3.16.0 react-native-gesture-handler

# Styling
npx expo install nativewind tailwindcss@^3.4.17

# State management
npm install zustand

# Supabase
npx expo install @supabase/supabase-js

# RevenueCat (core SDK only - we'll build custom paywall)
npx expo install react-native-purchases

# Dev dependencies
npm install -D prettier prettier-plugin-tailwindcss
```

### Step 0.3: Download Google Fonts

Create fonts directory and download fonts:

```bash
mkdir -p assets/fonts

# Download Cinzel (brand font)
curl -L "https://fonts.google.com/download?family=Cinzel" -o /tmp/cinzel.zip
unzip /tmp/cinzel.zip -d /tmp/cinzel
cp /tmp/cinzel/static/Cinzel-Regular.ttf assets/fonts/
cp /tmp/cinzel/static/Cinzel-Bold.ttf assets/fonts/
cp /tmp/cinzel/static/Cinzel-SemiBold.ttf assets/fonts/

# Download Inter (UI font)
curl -L "https://fonts.google.com/download?family=Inter" -o /tmp/inter.zip
unzip /tmp/inter.zip -d /tmp/inter
cp /tmp/inter/static/Inter_18pt-Regular.ttf assets/fonts/Inter-Regular.ttf
cp /tmp/inter/static/Inter_18pt-Medium.ttf assets/fonts/Inter-Medium.ttf
cp /tmp/inter/static/Inter_18pt-SemiBold.ttf assets/fonts/Inter-SemiBold.ttf

# Download Cormorant Garamond (oracle font)
curl -L "https://fonts.google.com/download?family=Cormorant%20Garamond" -o /tmp/cormorant.zip
unzip /tmp/cormorant.zip -d /tmp/cormorant
cp /tmp/cormorant/CormorantGaramond-Regular.ttf assets/fonts/
cp /tmp/cormorant/CormorantGaramond-Italic.ttf assets/fonts/
cp /tmp/cormorant/CormorantGaramond-Medium.ttf assets/fonts/

# Cleanup
rm -rf /tmp/cinzel /tmp/inter /tmp/cormorant /tmp/*.zip
```

### Step 0.4: Configure app.json

Replace the entire contents of `app.json`:

```json
{
  "expo": {
    "name": "Codex Tarot",
    "slug": "codex-tarot",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "codextarot",
    "userInterfaceStyle": "dark",
    "newArchEnabled": false,
    "splash": {
      "image": "./assets/images/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#0A0A0F"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.codextarot.app",
      "buildNumber": "1",
      "infoPlist": {
        "ITSAppUsesNonExemptEncryption": false
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#0A0A0F"
      },
      "package": "com.codextarot.app",
      "versionCode": 1
    },
    "web": {
      "bundler": "metro",
      "output": "static"
    },
    "plugins": [
      "expo-router",
      "expo-font",
      "expo-secure-store",
      [
        "expo-splash-screen",
        {
          "backgroundColor": "#0A0A0F",
          "image": "./assets/images/splash.png",
          "imageWidth": 200
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true
    },
    "extra": {
      "router": {
        "origin": false
      },
      "eas": {
        "projectId": "your-project-id-here"
      }
    }
  }
}
```

### Step 0.5: Configure EAS Build

Install EAS CLI and configure:

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo account
eas login

# Initialize EAS in project
eas build:configure
```

Create `eas.json` in project root:

```json
{
  "cli": {
    "version": ">= 12.0.0",
    "appVersionSource": "local"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_ENV": "development"
      },
      "ios": {
        "simulator": true
      },
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleDebug"
      }
    },
    "development-device": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_ENV": "development"
      },
      "ios": {
        "simulator": false
      },
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_ENV": "preview"
      },
      "ios": {
        "simulator": false
      },
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_ENV": "production"
      },
      "ios": {
        "autoIncrement": true
      },
      "android": {
        "autoIncrement": true,
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### Step 0.6: Configure Tailwind + NativeWind

Create `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        void: "#0A0A0F",
        nebula: "#12121A",
        surface: "#1A1A24",
        
        // Brand
        gold: "#C9A962",
        "gold-muted": "#8B7355",
        "gold-dim": "#6B5B45",
        
        // Accents
        purple: "#6B5B95",
        "purple-muted": "#4A4066",
        blue: "#4A7C9B",
        "blue-muted": "#3A5F78",
        
        // Text
        "text-primary": "#E8E6E3",
        "text-secondary": "#8A8A8A",
        "text-muted": "#5A5A5A",
        
        // States
        error: "#9B4A4A",
        success: "#4A9B6B",
      },
      fontFamily: {
        // Brand
        cinzel: ["Cinzel-Regular"],
        "cinzel-semibold": ["Cinzel-SemiBold"],
        "cinzel-bold": ["Cinzel-Bold"],
        
        // UI
        sans: ["Inter-Regular"],
        "sans-medium": ["Inter-Medium"],
        "sans-semibold": ["Inter-SemiBold"],
        
        // Oracle
        cormorant: ["CormorantGaramond-Regular"],
        "cormorant-medium": ["CormorantGaramond-Medium"],
        "cormorant-italic": ["CormorantGaramond-Italic"],
      },
      fontSize: {
        "2xs": ["10px", "14px"],
      },
      spacing: {
        18: "72px",
        88: "352px",
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
      },
    },
  },
  plugins: [],
};
```

Create `global.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Create `nativewind-env.d.ts`:

```typescript
/// <reference types="nativewind/types" />
```

### Step 0.7: Configure Babel

Replace `babel.config.js`:

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      "react-native-reanimated/plugin",
    ],
  };
};
```

### Step 0.8: Configure Metro

Create `metro.config.js`:

```javascript
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./global.css" });
```

### Step 0.9: Configure TypeScript

Replace `tsconfig.json`:

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"],
      "@/assets/*": ["./assets/*"],
      "@/data/*": ["./data/*"]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts",
    "nativewind-env.d.ts"
  ]
}
```

### Step 0.10: Create Directory Structure

```bash
# Create all directories
mkdir -p app/reading
mkdir -p components/ui
mkdir -p components/tarot
mkdir -p lib/api
mkdir -p lib/store
mkdir -p lib/utils
mkdir -p lib/hooks
mkdir -p assets/images
mkdir -p assets/cards
mkdir -p data
mkdir -p supabase/functions/reading
mkdir -p constants
```

### Step 0.11: Create Placeholder Assets

Create temporary placeholder images (replace with real assets later):

```bash
# Create placeholder icon (1024x1024 for iOS, will be resized)
# For now, create a simple placeholder
convert -size 1024x1024 xc:#0A0A0F -fill "#C9A962" -gravity center -pointsize 200 -annotate 0 "CT" assets/images/icon.png 2>/dev/null || echo "ImageMagick not installed - create icon.png manually (1024x1024)"

# Create placeholder splash (use same)
cp assets/images/icon.png assets/images/splash.png 2>/dev/null || echo "Create splash.png manually"

# Create placeholder adaptive icon
cp assets/images/icon.png assets/images/adaptive-icon.png 2>/dev/null || echo "Create adaptive-icon.png manually"
```

If ImageMagick isn't available, create these files manually:
- `assets/images/icon.png` — 1024x1024px, dark background (#0A0A0F) with gold "CT" text
- `assets/images/splash.png` — Same as icon for now
- `assets/images/adaptive-icon.png` — Same as icon for now

### Step 0.12: Create Root Layout

Create `app/_layout.tsx`:

```typescript
import "../global.css";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Prevent splash screen from hiding until fonts are loaded
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    "Cinzel-Regular": require("../assets/fonts/Cinzel-Regular.ttf"),
    "Cinzel-SemiBold": require("../assets/fonts/Cinzel-SemiBold.ttf"),
    "Cinzel-Bold": require("../assets/fonts/Cinzel-Bold.ttf"),
    "Inter-Regular": require("../assets/fonts/Inter-Regular.ttf"),
    "Inter-Medium": require("../assets/fonts/Inter-Medium.ttf"),
    "Inter-SemiBold": require("../assets/fonts/Inter-SemiBold.ttf"),
    "CormorantGaramond-Regular": require("../assets/fonts/CormorantGaramond-Regular.ttf"),
    "CormorantGaramond-Medium": require("../assets/fonts/CormorantGaramond-Medium.ttf"),
    "CormorantGaramond-Italic": require("../assets/fonts/CormorantGaramond-Italic.ttf"),
  });

  useEffect(() => {
    async function prepare() {
      if (fontsLoaded || fontError) {
        await SplashScreen.hideAsync();
        setAppIsReady(true);
      }
    }
    prepare();
  }, [fontsLoaded, fontError]);

  if (!appIsReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#0A0A0F" },
            animation: "fade",
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen 
            name="reading/[id]" 
            options={{ 
              animation: "slide_from_bottom",
              gestureEnabled: false,
            }} 
          />
          <Stack.Screen 
            name="paywall" 
            options={{ 
              presentation: "modal",
              animation: "slide_from_bottom",
            }} 
          />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
```

### Step 0.13: Create Home Screen

Create `app/index.tsx`:

```typescript
import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

export default function HomeScreen() {
  const [intention, setIntention] = useState("");
  const [spreadType, setSpreadType] = useState<"single" | "three" | "five">("single");

  return (
    <View className="flex-1 bg-void">
      <SafeAreaView className="flex-1">
        <View className="flex-1 items-center justify-center px-6">
          {/* Title */}
          <Animated.View entering={FadeIn.duration(800)}>
            <Text className="font-cinzel-bold text-4xl text-gold text-center tracking-widest">
              CODEX TAROT
            </Text>
          </Animated.View>

          {/* Subtitle */}
          <Animated.View entering={FadeInDown.delay(300).duration(600)}>
            <Text className="font-cormorant-italic text-xl text-text-secondary text-center mt-4">
              The cards await your question
            </Text>
          </Animated.View>

          {/* Spread Selection */}
          <Animated.View 
            entering={FadeInDown.delay(600).duration(600)}
            className="flex-row gap-4 mt-12"
          >
            {(["single", "three", "five"] as const).map((type) => (
              <Pressable
                key={type}
                onPress={() => setSpreadType(type)}
                className={`px-6 py-3 rounded-2xl border ${
                  spreadType === type
                    ? "bg-gold/10 border-gold"
                    : "bg-surface border-surface"
                }`}
              >
                <Text
                  className={`font-sans-medium text-sm ${
                    spreadType === type ? "text-gold" : "text-text-secondary"
                  }`}
                >
                  {type === "single" ? "1 Card" : type === "three" ? "3 Cards" : "5 Cards"}
                </Text>
                {type !== "single" && (
                  <Text className="font-sans text-2xs text-purple text-center mt-1">
                    PRO
                  </Text>
                )}
              </Pressable>
            ))}
          </Animated.View>

          {/* Status text */}
          <Animated.View entering={FadeInDown.delay(900).duration(600)} className="mt-8">
            <Text className="font-sans text-sm text-text-muted text-center">
              Infrastructure validated ✓
            </Text>
            <Text className="font-sans text-xs text-text-muted text-center mt-2">
              Fonts: Cinzel, Inter, Cormorant Garamond
            </Text>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}
```

### Step 0.14: Create Placeholder Screens

Create `app/reading/[id].tsx`:

```typescript
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";

export default function ReadingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View className="flex-1 bg-void">
      <SafeAreaView className="flex-1 items-center justify-center">
        <Text className="font-cinzel text-2xl text-gold">Reading</Text>
        <Text className="font-sans text-text-secondary mt-2">ID: {id}</Text>
      </SafeAreaView>
    </View>
  );
}
```

Create `app/paywall.tsx`:

```typescript
import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

export default function PaywallScreen() {
  return (
    <View className="flex-1 bg-nebula">
      <SafeAreaView className="flex-1 items-center justify-center px-6">
        <Text className="font-cinzel text-2xl text-gold text-center">
          Unlock Full Readings
        </Text>
        <Text className="font-cormorant text-lg text-text-secondary text-center mt-4">
          Access 3-card and 5-card spreads
        </Text>
        
        <Pressable
          onPress={() => router.back()}
          className="mt-8 px-8 py-4 bg-surface rounded-2xl"
        >
          <Text className="font-sans-medium text-text-primary">
            Close
          </Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}
```

### Step 0.15: Create Environment File

Create `.env.local` (gitignored):

```bash
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
EXPO_PUBLIC_REVENUECAT_IOS_KEY=your_revenuecat_ios_key_here
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=your_revenuecat_android_key_here
```

Update `.gitignore` to include:

```
.env.local
.env*.local
```

### Step 0.16: Validate Setup

Run validation commands in sequence:

```bash
# 1. Clear any cached data
npx expo start --clear

# 2. Test Metro bundler starts (press Ctrl+C to stop after it starts)
npx expo start

# 3. Test iOS Simulator (if on Mac)
npx expo run:ios

# 4. Test Android Emulator
npx expo run:android
```

### Phase 0 Validation Checklist

**STOP. Do not proceed until ALL items pass:**

- [ ] `npx expo start` — Metro bundler launches without errors
- [ ] iOS Simulator shows home screen with gold "CODEX TAROT" text in Cinzel font
- [ ] Android Emulator shows home screen with gold "CODEX TAROT" text in Cinzel font
- [ ] Subtitle displays in Cormorant Garamond italic
- [ ] Spread selection buttons display in Inter font
- [ ] Background is dark (#0A0A0F)
- [ ] Animations play smoothly (fade in sequence)
- [ ] NativeWind classes apply correctly (colors, spacing, fonts)
- [ ] No console errors about fonts or Reanimated
- [ ] Can tap spread selection buttons and see visual feedback

**If any checkbox fails**: Debug and fix before proceeding. Common issues:
- Font not loading → Check file paths in `_layout.tsx`
- NativeWind not working → Clear Metro cache: `npx expo start --clear`
- Reanimated crash → Ensure babel.config.js has plugin last in array

---

## PHASE 1: UI COMPONENTS + ATMOSPHERE

Only begin after Phase 0 is fully validated.

### Step 1.1: Create UI Primitives

Create `components/ui/Text.tsx`:

```typescript
import { Text as RNText, TextProps, TextStyle } from "react-native";
import { ReactNode } from "react";

type Variant =
  | "title"
  | "heading"
  | "subheading"
  | "body"
  | "caption"
  | "label"
  | "oracle"
  | "oracleItalic";

interface Props extends TextProps {
  variant?: Variant;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<Variant, string> = {
  title: "font-cinzel-bold text-4xl text-gold tracking-widest",
  heading: "font-cinzel text-2xl text-gold",
  subheading: "font-cinzel text-lg text-gold",
  body: "font-sans text-base text-text-primary",
  caption: "font-sans text-sm text-text-secondary",
  label: "font-sans-medium text-xs text-text-secondary uppercase tracking-wider",
  oracle: "font-cormorant text-lg text-text-primary leading-relaxed",
  oracleItalic: "font-cormorant-italic text-lg text-text-primary leading-relaxed",
};

export function Text({ variant = "body", className = "", children, ...props }: Props) {
  return (
    <RNText className={`${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </RNText>
  );
}
```

Create `components/ui/Button.tsx`:

```typescript
import { Pressable, PressableProps } from "react-native";
import { Text } from "./Text";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Variant = "primary" | "secondary" | "ghost";

interface Props extends Omit<PressableProps, "children"> {
  variant?: Variant;
  children: string;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-gold",
  secondary: "bg-surface border border-gold-muted",
  ghost: "bg-transparent",
};

const textClasses: Record<Variant, string> = {
  primary: "text-void",
  secondary: "text-gold",
  ghost: "text-text-secondary",
};

export function Button({
  variant = "primary",
  children,
  disabled,
  loading,
  onPress,
  ...props
}: Props) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15 });
    opacity.value = withTiming(0.9, { duration: 100 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
    opacity.value = withTiming(1, { duration: 150 });
  };

  const isDisabled = disabled || loading;

  return (
    <AnimatedPressable
      style={animatedStyle}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={isDisabled}
      className={`py-4 px-8 rounded-2xl items-center justify-center ${variantClasses[variant]} ${
        isDisabled ? "opacity-50" : ""
      }`}
      {...props}
    >
      <Text
        variant="label"
        className={`text-base ${textClasses[variant]}`}
      >
        {loading ? "..." : children}
      </Text>
    </AnimatedPressable>
  );
}
```

Create `components/ui/Input.tsx`:

```typescript
import { TextInput, TextInputProps, View } from "react-native";
import { Text } from "./Text";
import { useState } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

interface Props extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, onFocus, onBlur, ...props }: Props) {
  const [isFocused, setIsFocused] = useState(false);
  const borderOpacity = useSharedValue(0);

  const animatedBorderStyle = useAnimatedStyle(() => ({
    borderColor: `rgba(201, 169, 98, ${borderOpacity.value})`,
  }));

  const handleFocus = (e: any) => {
    setIsFocused(true);
    borderOpacity.value = withTiming(1, { duration: 200 });
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    borderOpacity.value = withTiming(0.3, { duration: 200 });
    onBlur?.(e);
  };

  return (
    <View>
      {label && (
        <Text variant="label" className="mb-2">
          {label}
        </Text>
      )}
      <Animated.View
        style={[animatedBorderStyle]}
        className="bg-surface rounded-2xl border border-surface"
      >
        <TextInput
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor="#5A5A5A"
          className="p-4 font-sans text-base text-text-primary min-h-[100px]"
          style={{ textAlignVertical: "top" }}
          {...props}
        />
      </Animated.View>
      {error && (
        <Text variant="caption" className="text-error mt-2">
          {error}
        </Text>
      )}
    </View>
  );
}
```

Create `components/ui/Loading.tsx`:

```typescript
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { useEffect } from "react";

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  className?: string;
}

export function Skeleton({ width = "100%", height = 20, className = "" }: SkeletonProps) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.6, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[{ width, height }, animatedStyle]}
      className={`bg-surface rounded-xl ${className}`}
    />
  );
}

export function LoadingDots({ color = "#C9A962" }: { color?: string }) {
  return (
    <View className="flex-row items-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <Dot key={i} delay={i * 150} color={color} />
      ))}
    </View>
  );
}

function Dot({ delay, color }: { delay: number; color: string }) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    backgroundColor: color,
  }));

  return (
    <Animated.View
      style={animatedStyle}
      className="w-2 h-2 rounded-full"
    />
  );
}

export function ReadingLoader() {
  return (
    <View className="py-6">
      <View className="flex-row items-center gap-3">
        <LoadingDots />
        <Animated.Text
          entering={require("react-native-reanimated").FadeIn.duration(500)}
          className="font-cormorant-italic text-base text-text-secondary"
        >
          The cards are speaking...
        </Animated.Text>
      </View>
    </View>
  );
}
```

### Step 1.2: Create Atmospheric Components

Create `components/tarot/StarField.tsx`:

```typescript
import { useEffect, useMemo } from "react";
import { Dimensions, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  baseOpacity: number;
}

function generateStars(count: number): Star[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * SCREEN_WIDTH,
    y: Math.random() * SCREEN_HEIGHT,
    size: Math.random() * 2 + 0.5,
    delay: Math.random() * 4000,
    duration: Math.random() * 3000 + 2000,
    baseOpacity: Math.random() * 0.3 + 0.2,
  }));
}

function StarPoint({ star }: { star: Star }) {
  const opacity = useSharedValue(star.baseOpacity);

  useEffect(() => {
    opacity.value = withDelay(
      star.delay,
      withRepeat(
        withTiming(star.baseOpacity + 0.5, {
          duration: star.duration,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    position: "absolute",
    left: star.x,
    top: star.y,
    width: star.size,
    height: star.size,
    borderRadius: star.size / 2,
    backgroundColor: "#E8E6E3",
  }));

  return <Animated.View style={animatedStyle} />;
}

interface Props {
  starCount?: number;
}

export function StarField({ starCount = 60 }: Props) {
  const stars = useMemo(() => generateStars(starCount), [starCount]);

  return (
    <View 
      className="absolute inset-0 overflow-hidden" 
      pointerEvents="none"
    >
      {stars.map((star) => (
        <StarPoint key={star.id} star={star} />
      ))}
    </View>
  );
}
```

Create `components/tarot/FogLayer.tsx`:

```typescript
import { useEffect } from "react";
import { Dimensions, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export function FogLayer() {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { 
        duration: 25000, 
        easing: Easing.inOut(Easing.ease) 
      }),
      -1,
      true
    );
  }, []);

  const fogStyle1 = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(progress.value, [0, 1], [-60, 60]) },
      { translateY: interpolate(progress.value, [0, 1], [-20, 40]) },
    ],
    opacity: interpolate(progress.value, [0, 0.5, 1], [0.08, 0.15, 0.08]),
  }));

  const fogStyle2 = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(progress.value, [0, 1], [40, -40]) },
      { translateY: interpolate(progress.value, [0, 1], [30, -10]) },
    ],
    opacity: interpolate(progress.value, [0, 0.5, 1], [0.12, 0.06, 0.12]),
  }));

  const fogStyle3 = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(progress.value, [0, 1], [-30, 50]) },
      { translateY: interpolate(progress.value, [0, 1], [10, -30]) },
    ],
    opacity: interpolate(progress.value, [0, 0.5, 1], [0.05, 0.1, 0.05]),
  }));

  return (
    <View className="absolute inset-0 overflow-hidden" pointerEvents="none">
      {/* Purple fog - top */}
      <Animated.View
        style={[
          {
            position: "absolute",
            width: SCREEN_WIDTH * 1.8,
            height: SCREEN_HEIGHT * 0.5,
            top: -100,
            left: -SCREEN_WIDTH * 0.4,
          },
          fogStyle1,
        ]}
      >
        <LinearGradient
          colors={["transparent", "rgba(107, 91, 149, 0.2)", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1 }}
        />
      </Animated.View>

      {/* Blue fog - bottom */}
      <Animated.View
        style={[
          {
            position: "absolute",
            width: SCREEN_WIDTH * 1.6,
            height: SCREEN_HEIGHT * 0.4,
            bottom: -50,
            left: -SCREEN_WIDTH * 0.3,
          },
          fogStyle2,
        ]}
      >
        <LinearGradient
          colors={["transparent", "rgba(74, 124, 155, 0.15)", "transparent"]}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ flex: 1 }}
        />
      </Animated.View>

      {/* Gold fog - center */}
      <Animated.View
        style={[
          {
            position: "absolute",
            width: SCREEN_WIDTH * 1.4,
            height: SCREEN_HEIGHT * 0.3,
            top: SCREEN_HEIGHT * 0.35,
            left: -SCREEN_WIDTH * 0.2,
          },
          fogStyle3,
        ]}
      >
        <LinearGradient
          colors={["transparent", "rgba(201, 169, 98, 0.05)", "transparent"]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
    </View>
  );
}
```

### Step 1.3: Create Tarot Card Component

Create `components/tarot/TarotCard.tsx`:

```typescript
import { View, Image, Pressable, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Text } from "../ui/Text";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Card aspect ratio based on provided dimensions: 540x1018
const CARD_ASPECT_RATIO = 540 / 1018;

interface Props {
  name: string;
  image: any; // require() image or { uri: string }
  isRevealed?: boolean;
  size?: "small" | "medium" | "large";
  onPress?: () => void;
  showName?: boolean;
}

const sizeConfig = {
  small: { width: SCREEN_WIDTH * 0.22 },
  medium: { width: SCREEN_WIDTH * 0.35 },
  large: { width: SCREEN_WIDTH * 0.55 },
};

export function TarotCard({
  name,
  image,
  isRevealed = false,
  size = "medium",
  onPress,
  showName = true,
}: Props) {
  const rotateY = useSharedValue(isRevealed ? 0 : 180);
  const scale = useSharedValue(1);

  const cardWidth = sizeConfig[size].width;
  const cardHeight = cardWidth / CARD_ASPECT_RATIO;

  const frontStyle = useAnimatedStyle(() => {
    const rotate = interpolate(rotateY.value, [0, 180], [0, 180]);
    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotate}deg` },
        { scale: scale.value },
      ],
      backfaceVisibility: "hidden",
    };
  });

  const backStyle = useAnimatedStyle(() => {
    const rotate = interpolate(rotateY.value, [0, 180], [180, 360]);
    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotate}deg` },
        { scale: scale.value },
      ],
      backfaceVisibility: "hidden",
    };
  });

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress();
    }
  };

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const reveal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    rotateY.value = withTiming(0, {
      duration: 800,
      easing: Easing.inOut(Easing.ease),
    });
  };

  return (
    <View className="items-center">
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={{ width: cardWidth, height: cardHeight }}>
          {/* Card Back */}
          <Animated.View
            style={[
              {
                position: "absolute",
                width: cardWidth,
                height: cardHeight,
              },
              backStyle,
            ]}
          >
            <View className="flex-1 bg-nebula rounded-xl border border-gold-dim items-center justify-center">
              {/* Simple back design - replace with actual design later */}
              <View className="w-12 h-12 border-2 border-gold-muted rounded-full items-center justify-center">
                <Text className="font-cinzel text-gold-muted text-lg">✦</Text>
              </View>
            </View>
          </Animated.View>

          {/* Card Front */}
          <Animated.View
            style={[
              {
                position: "absolute",
                width: cardWidth,
                height: cardHeight,
              },
              frontStyle,
            ]}
          >
            <Image
              source={image}
              style={{
                width: cardWidth,
                height: cardHeight,
                borderRadius: 12,
              }}
              resizeMode="cover"
            />
          </Animated.View>
        </View>
      </Pressable>

      {/* Card Name */}
      {showName && isRevealed && (
        <Animated.View
          entering={require("react-native-reanimated").FadeIn.delay(400).duration(500)}
          className="mt-3"
        >
          <Text variant="caption" className="text-center text-gold">
            {name}
          </Text>
        </Animated.View>
      )}
    </View>
  );
}
```

### Step 1.4: Update Home Screen with Atmosphere

Replace `app/index.tsx`:

```typescript
import { View, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { router } from "expo-router";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { StarField } from "@/components/tarot/StarField";
import { FogLayer } from "@/components/tarot/FogLayer";
import * as Haptics from "expo-haptics";

type SpreadType = "single" | "three" | "five";

const spreadOptions: { type: SpreadType; label: string; cards: number; free: boolean }[] = [
  { type: "single", label: "1 Card", cards: 1, free: true },
  { type: "three", label: "3 Cards", cards: 3, free: false },
  { type: "five", label: "5 Cards", cards: 5, free: false },
];

export default function HomeScreen() {
  const [intention, setIntention] = useState("");
  const [spreadType, setSpreadType] = useState<SpreadType>("single");
  const [isLoading, setIsLoading] = useState(false);

  const selectedSpread = spreadOptions.find((s) => s.type === spreadType)!;

  const handleSpreadSelect = (type: SpreadType) => {
    Haptics.selectionAsync();
    setSpreadType(type);
  };

  const handleDrawCards = async () => {
    if (!intention.trim()) return;

    // Check if paid spread and not subscribed
    if (!selectedSpread.free) {
      // TODO: Check subscription status
      // For now, show paywall
      router.push("/paywall");
      return;
    }

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // TODO: Navigate to reading screen with params
    // For now, simulate and navigate
    setTimeout(() => {
      setIsLoading(false);
      router.push({
        pathname: "/reading/[id]",
        params: { 
          id: Date.now().toString(),
          intention,
          spreadType,
        },
      });
    }, 500);
  };

  return (
    <View className="flex-1 bg-void">
      <StarField starCount={70} />
      <FogLayer />

      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="flex-1 px-6 pt-12 pb-8">
              {/* Header */}
              <Animated.View entering={FadeIn.duration(800)} className="items-center">
                <Text variant="title">CODEX TAROT</Text>
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(200).duration(600)} className="items-center">
                <Text variant="oracleItalic" className="text-text-secondary text-center mt-4">
                  What question do you bring to the cards?
                </Text>
              </Animated.View>

              {/* Intention Input */}
              <Animated.View entering={FadeInDown.delay(400).duration(600)} className="mt-10">
                <TextInput
                  value={intention}
                  onChangeText={setIntention}
                  placeholder="Enter your intention..."
                  placeholderTextColor="#5A5A5A"
                  multiline
                  numberOfLines={4}
                  maxLength={500}
                  className="bg-surface border border-surface rounded-2xl p-4 font-sans text-base text-text-primary min-h-[120px]"
                  style={{ textAlignVertical: "top" }}
                />
                <Text variant="caption" className="text-right mt-2 text-text-muted">
                  {intention.length}/500
                </Text>
              </Animated.View>

              {/* Spread Selection */}
              <Animated.View entering={FadeInDown.delay(600).duration(600)} className="mt-8">
                <Text variant="label" className="text-center mb-4">
                  Choose your spread
                </Text>
                <View className="flex-row justify-center gap-3">
                  {spreadOptions.map((option) => (
                    <Pressable
                      key={option.type}
                      onPress={() => handleSpreadSelect(option.type)}
                      className={`flex-1 max-w-[100px] py-4 rounded-2xl border items-center ${
                        spreadType === option.type
                          ? "bg-gold/10 border-gold"
                          : "bg-surface border-surface"
                      }`}
                    >
                      <Text
                        variant="label"
                        className={`text-sm ${
                          spreadType === option.type ? "text-gold" : "text-text-secondary"
                        }`}
                      >
                        {option.label}
                      </Text>
                      {!option.free && (
                        <Text className="font-sans text-2xs text-purple mt-1">
                          PRO
                        </Text>
                      )}
                    </Pressable>
                  ))}
                </View>
              </Animated.View>

              {/* Spacer */}
              <View className="flex-1 min-h-[40px]" />

              {/* Draw Button */}
              <Animated.View entering={FadeInDown.delay(800).duration(600)}>
                <Button
                  variant="primary"
                  disabled={!intention.trim()}
                  loading={isLoading}
                  onPress={handleDrawCards}
                >
                  Draw Cards
                </Button>
              </Animated.View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
```

### Step 1.5: Update Path Aliases

Update `tsconfig.json` to enable path aliases:

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts",
    "nativewind-env.d.ts"
  ]
}
```

### Phase 1 Validation Checklist

- [ ] Home screen shows with animated star field
- [ ] Fog layers animate smoothly (3 layers, different colors)
- [ ] Title uses Cinzel Bold font in gold
- [ ] Subtitle uses Cormorant Garamond italic
- [ ] Text input works with character counter
- [ ] Spread selection buttons have haptic feedback
- [ ] Button disabled state works (when no intention)
- [ ] PRO badge shows on 3 and 5 card options
- [ ] All animations are smooth (60fps)
- [ ] Keyboard avoidance works on iOS and Android
- [ ] Tapping 3 or 5 cards navigates to paywall modal

---

## PHASE 2: CARD DATA + READING ENGINE

### Step 2.1: Create Card Data Types

Create `lib/types/tarot.ts`:

```typescript
export interface Card {
  id: string;
  name: string;
  arcanaType: "major" | "minor" | "court";
  arcanaNumber?: string;
  number?: string;
  suit?: string;
  keywords: string[];
  description: string;
  interpretations: string;
  reading: string;
  monologue: string;
  image: string;
  degree?: {
    meaning: string;
    shadow: string;
  };
}

export interface Suit {
  suit: string;
  element: string;
  description: string;
  finalStage: string;
}

export interface Degree {
  degree: string;
  synonyms: string[];
  relatedArcana: string[];
  warnings: string;
  meaning: string;
  shadow: string;
}

export interface Spread {
  type: "single" | "three" | "five";
  positions: string[];
}

export interface CardData {
  cards: Card[];
  suits: Suit[];
  degrees: Degree[];
  spreads: {
    single: Spread;
    three: Spread;
    five: Spread;
  };
}

export interface CardAnalysis {
  position: string;
  card: string;
  analysis: string;
  image: string;
}

export interface Reading {
  id: string;
  timestamp: string;
  intention: string;
  spreadType: "single" | "three" | "five";
  opening: string;
  cards: CardAnalysis[];
  synthesis: string | null;
  oracle: string;
}

export type ReadingStatus =
  | "idle"
  | "drawing"
  | "analyzing"
  | "synthesizing"
  | "oracle"
  | "complete"
  | "error";
```

### Step 2.2: Create Reading Store

Create `lib/store/reading.ts`:

```typescript
import { create } from "zustand";
import type { Card, CardAnalysis, Reading, ReadingStatus } from "@/lib/types/tarot";

interface ReadingState {
  // Input
  intention: string;
  spreadType: "single" | "three" | "five";
  selectedCards: Card[];

  // Progress
  status: ReadingStatus;
  retryCount: number;

  // Results (arrive progressively)
  opening: string | null;
  cardAnalyses: CardAnalysis[] | null;
  synthesis: string | null;
  oracle: string | null;

  // Error
  error: string | null;

  // Actions
  setIntention: (intention: string) => void;
  setSpreadType: (type: "single" | "three" | "five") => void;
  setSelectedCards: (cards: Card[]) => void;
  setStatus: (status: ReadingStatus) => void;
  setOpening: (opening: string) => void;
  setCardAnalyses: (analyses: CardAnalysis[]) => void;
  setSynthesis: (synthesis: string) => void;
  setOracle: (oracle: string) => void;
  setError: (error: string | null) => void;
  incrementRetry: () => void;
  reset: () => void;

  // Computed
  currentReading: () => Reading | null;
}

const initialState = {
  intention: "",
  spreadType: "single" as const,
  selectedCards: [],
  status: "idle" as ReadingStatus,
  retryCount: 0,
  opening: null,
  cardAnalyses: null,
  synthesis: null,
  oracle: null,
  error: null,
};

export const useReadingStore = create<ReadingState>((set, get) => ({
  ...initialState,

  setIntention: (intention) => set({ intention }),
  setSpreadType: (spreadType) => set({ spreadType }),
  setSelectedCards: (selectedCards) => set({ selectedCards }),
  setStatus: (status) => set({ status }),
  setOpening: (opening) => set({ opening }),
  setCardAnalyses: (cardAnalyses) => set({ cardAnalyses }),
  setSynthesis: (synthesis) => set({ synthesis }),
  setOracle: (oracle) => set({ oracle }),
  setError: (error) => set({ error }),
  incrementRetry: () => set((state) => ({ retryCount: state.retryCount + 1 })),

  reset: () => set(initialState),

  currentReading: () => {
    const state = get();
    if (state.status !== "complete") return null;

    return {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      intention: state.intention,
      spreadType: state.spreadType,
      opening: state.opening!,
      cards: state.cardAnalyses!,
      synthesis: state.synthesis,
      oracle: state.oracle!,
    };
  },
}));
```

### Step 2.3: Create Supabase Client

Create `lib/api/supabase.ts`:

```typescript
import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Custom storage adapter for React Native
const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string) => {
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string) => {
    await SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

### Step 2.4: Create Reading API

Create `lib/api/reading.ts`:

```typescript
import { supabase } from "./supabase";
import type { Card, CardAnalysis } from "@/lib/types/tarot";

interface GenerateReadingParams {
  intention: string;
  spreadType: "single" | "three" | "five";
  cards: Card[];
}

interface Call1Response {
  opening: string;
  cards: CardAnalysis[];
}

interface Call2Response {
  synthesis: string;
}

interface Call3Response {
  oracle: string;
}

export async function generateCardAnalyses(
  params: GenerateReadingParams
): Promise<Call1Response> {
  const { data, error } = await supabase.functions.invoke("reading", {
    body: {
      action: "analyze",
      intention: params.intention,
      spreadType: params.spreadType,
      cards: params.cards,
    },
  });

  if (error) throw new Error(error.message);
  return data;
}

export async function generateSynthesis(
  intention: string,
  cardAnalyses: CardAnalysis[]
): Promise<Call2Response> {
  const { data, error } = await supabase.functions.invoke("reading", {
    body: {
      action: "synthesize",
      intention,
      cardAnalyses,
    },
  });

  if (error) throw new Error(error.message);
  return data;
}

export async function generateOracle(
  intention: string,
  cards: Card[],
  synthesis: string | null
): Promise<Call3Response> {
  const { data, error } = await supabase.functions.invoke("reading", {
    body: {
      action: "oracle",
      intention,
      cards,
      synthesis,
    },
  });

  if (error) throw new Error(error.message);
  return data;
}
```

### Step 2.5: Create Reading Hook

Create `lib/hooks/useReading.ts`:

```typescript
import { useCallback } from "react";
import { useReadingStore } from "@/lib/store/reading";
import {
  generateCardAnalyses,
  generateSynthesis,
  generateOracle,
} from "@/lib/api/reading";
import type { Card } from "@/lib/types/tarot";

export function useReading() {
  const store = useReadingStore();

  const generateReading = useCallback(
    async (intention: string, spreadType: "single" | "three" | "five", cards: Card[]) => {
      store.setIntention(intention);
      store.setSpreadType(spreadType);
      store.setSelectedCards(cards);
      store.setError(null);

      try {
        // Call 1: Card analyses
        store.setStatus("analyzing");
        const call1 = await generateCardAnalyses({
          intention,
          spreadType,
          cards,
        });
        store.setOpening(call1.opening);
        store.setCardAnalyses(call1.cards);

        // Single card: skip synthesis
        if (spreadType === "single") {
          store.setStatus("oracle");
          const call3 = await generateOracle(intention, cards, null);
          store.setOracle(call3.oracle);
          store.setStatus("complete");
          return;
        }

        // Call 2: Synthesis
        store.setStatus("synthesizing");
        const call2 = await generateSynthesis(intention, call1.cards);
        store.setSynthesis(call2.synthesis);

        // Call 3: Oracle
        store.setStatus("oracle");
        const call3 = await generateOracle(intention, cards, call2.synthesis);
        store.setOracle(call3.oracle);

        store.setStatus("complete");
      } catch (error) {
        const retryCount = store.retryCount;
        
        if (retryCount < 1) {
          // Retry once
          store.incrementRetry();
          return generateReading(intention, spreadType, cards);
        }

        store.setError(
          error instanceof Error ? error.message : "Reading failed. Please try again."
        );
        store.setStatus("error");
      }
    },
    [store]
  );

  return {
    ...store,
    generateReading,
  };
}
```

---

## PHASE 3: SUPABASE EDGE FUNCTION

Create the edge function for Claude API integration.

### Step 3.1: Create Edge Function

Create `supabase/functions/reading/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Anthropic from "npm:@anthropic-ai/sdk@0.24.0";

const anthropic = new Anthropic({
  apiKey: Deno.env.get("ANTHROPIC_API_KEY"),
});

const GLOBAL_SYSTEM_PROMPT = `You are The Reader of the Codex Tarot — an interpreter of the Tarot de Marseille in the tradition of Jodorowsky and the symbolic school.

VOICE:
- British English
- Warm but direct — no false comfort, no doom
- Balance light and shadow in every card
- Grounded mysticism: poetic but never vague

CONSTRAINTS:
- Draw ONLY from the provided card data
- Never invent symbolism not present in the source
- Never use clichés ("trust the universe", "everything happens for a reason")
- Never give yes/no answers — illuminate, don't prescribe

KNOWLEDGE:
- Cards influence each other by position and proximity
- Numbers carry developmental meaning (1=potential, 9=crisis, 10=completion)
- Suits carry elemental energy (Swords=air, Cups=water, Wands=fire, Pentacles=earth)
- Major Arcana = universal forces; Minor Arcana = personal experience
- Symbolic handoffs between cards should be noted when prominent`;

interface Card {
  name: string;
  keywords: string[];
  description: string;
  interpretations: string;
  reading: string;
  monologue: string;
  degree?: { meaning: string; shadow: string };
  suit?: string;
}

interface CardWithPosition {
  position: string;
  card: Card;
}

serve(async (req) => {
  try {
    const { action, intention, spreadType, cards, cardAnalyses, synthesis } =
      await req.json();

    let result;

    switch (action) {
      case "analyze":
        result = await analyzeCards(intention, spreadType, cards);
        break;
      case "synthesize":
        result = await synthesizeReading(intention, cardAnalyses);
        break;
      case "oracle":
        result = await generateOracle(intention, cards, synthesis);
        break;
      default:
        throw new Error("Invalid action");
    }

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

async function analyzeCards(
  intention: string,
  spreadType: string,
  cards: CardWithPosition[]
): Promise<{ opening: string; cards: any[] }> {
  const wordCount = spreadType === "single" ? 150 : spreadType === "three" ? 80 : 60;

  const cardsPrompt = cards
    .map(
      ({ position, card }) => `
---
POSITION: ${position}
CARD: ${card.name}
Keywords: ${card.keywords.join(", ")}
Description: ${card.description}
Reading: ${card.reading}
${card.degree ? `Degree meaning: ${card.degree.meaning}\nDegree shadow: ${card.degree.shadow}` : ""}
${card.suit ? `Suit: ${card.suit}` : ""}
---`
    )
    .join("\n");

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    system: `${GLOBAL_SYSTEM_PROMPT}

TASK: Interpret each card in its position. Focus on what the card means here — do not yet weave cards together.

Write ~${wordCount} words per card. Include essence + one shadow note.
Be aware of suit/element patterns — let this inform your interpretation silently.`,
    messages: [
      {
        role: "user",
        content: `QUERENT'S QUESTION: "${intention}"

SPREAD: ${spreadType}

${cardsPrompt}

Return JSON only, no markdown:
{
  "opening": "1-2 sentence warm paraphrase of the question",
  "cards": [
    {"position": "...", "card": "...", "analysis": "..."}
  ]
}`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  return JSON.parse(text);
}

async function synthesizeReading(
  intention: string,
  cardAnalyses: any[]
): Promise<{ synthesis: string }> {
  const analysesText = cardAnalyses
    .map((c) => `${c.position} — ${c.card}:\n"${c.analysis}"`)
    .join("\n\n");

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1500,
    system: `${GLOBAL_SYSTEM_PROMPT}

TASK: Reveal how the cards speak to each other. This is where interpretation happens.

INCLUDE:
- The arc or movement across positions
- Numerological patterns if present
- How each card's energy affects its neighbors
- What this means for the querent's specific question
- Card-to-card transitions where there's clear symbolic handoff

OPTIONALLY END WITH:
- A reflection prompt if the reading reveals tension (~30% of readings)

LENGTH: ~300 words for 3-card, ~400 words for 5-card.`,
    messages: [
      {
        role: "user",
        content: `QUERENT'S QUESTION: "${intention}"

CARD ANALYSES:

${analysesText}

Return JSON only, no markdown:
{
  "synthesis": "..."
}`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  return JSON.parse(text);
}

async function generateOracle(
  intention: string,
  cards: CardWithPosition[],
  synthesis: string | null
): Promise<{ oracle: string }> {
  const monologues = cards
    .map(({ card }) => `${card.name} speaks:\n"${card.monologue}"`)
    .join("\n\n");

  const wordCount = cards.length === 1 ? 120 : cards.length === 3 ? 180 : 200;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 800,
    system: `${GLOBAL_SYSTEM_PROMPT}

TASK: Channel the voice of the Tarot itself. The cards have merged into one consciousness addressing the querent directly.

VOICE:
- Poetic, rhythmic, incantatory
- Use imagery from the specific cards drawn
- Address the querent as "you"
- Do not repeat the synthesis — go deeper or offer a new angle
- End with something that lingers

LENGTH: ~${wordCount} words.`,
    messages: [
      {
        role: "user",
        content: `QUERENT'S QUESTION: "${intention}"

THE CARDS' VOICES:

${monologues}

${synthesis ? `THE READING CONCLUDED WITH:\n"${synthesis}"` : ""}

Return JSON only, no markdown:
{
  "oracle": "..."
}`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  return JSON.parse(text);
}
```

### Step 3.2: Deploy Edge Function

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Set secrets
supabase secrets set ANTHROPIC_API_KEY=your_anthropic_api_key

# Deploy the function
supabase functions deploy reading
```

---

## PHASE 4: PAYMENTS (RevenueCat)

### Step 4.1: Create Subscription Store

Create `lib/store/subscription.ts`:

```typescript
import { create } from "zustand";
import { Platform } from "react-native";
import Purchases, {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
} from "react-native-purchases";

interface SubscriptionState {
  isInitialized: boolean;
  isProUser: boolean;
  customerInfo: CustomerInfo | null;
  offerings: PurchasesOffering | null;
  isLoading: boolean;
  error: string | null;

  initialize: () => Promise<void>;
  checkSubscription: () => Promise<boolean>;
  purchasePackage: (pkg: PurchasesPackage) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
}

const REVENUECAT_IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY!;
const REVENUECAT_ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY!;

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  isInitialized: false,
  isProUser: false,
  customerInfo: null,
  offerings: null,
  isLoading: false,
  error: null,

  initialize: async () => {
    if (get().isInitialized) return;

    try {
      const apiKey = Platform.OS === "ios" ? REVENUECAT_IOS_KEY : REVENUECAT_ANDROID_KEY;
      
      if (!apiKey) {
        console.warn("RevenueCat API key not configured");
        set({ isInitialized: true });
        return;
      }

      await Purchases.configure({ apiKey });
      
      const customerInfo = await Purchases.getCustomerInfo();
      const offerings = await Purchases.getOfferings();
      
      const isProUser = customerInfo.entitlements.active["pro"] !== undefined;

      set({
        isInitialized: true,
        customerInfo,
        offerings: offerings.current,
        isProUser,
      });
    } catch (error) {
      console.error("RevenueCat init error:", error);
      set({ isInitialized: true, error: "Failed to initialize purchases" });
    }
  },

  checkSubscription: async () => {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const isProUser = customerInfo.entitlements.active["pro"] !== undefined;
      set({ customerInfo, isProUser });
      return isProUser;
    } catch (error) {
      console.error("Check subscription error:", error);
      return false;
    }
  },

  purchasePackage: async (pkg) => {
    set({ isLoading: true, error: null });
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      const isProUser = customerInfo.entitlements.active["pro"] !== undefined;
      set({ customerInfo, isProUser, isLoading: false });
      return isProUser;
    } catch (error: any) {
      if (!error.userCancelled) {
        set({ error: "Purchase failed. Please try again.", isLoading: false });
      } else {
        set({ isLoading: false });
      }
      return false;
    }
  },

  restorePurchases: async () => {
    set({ isLoading: true, error: null });
    try {
      const customerInfo = await Purchases.restorePurchases();
      const isProUser = customerInfo.entitlements.active["pro"] !== undefined;
      set({ customerInfo, isProUser, isLoading: false });
      return isProUser;
    } catch (error) {
      set({ error: "Restore failed. Please try again.", isLoading: false });
      return false;
    }
  },
}));
```

### Step 4.2: Update Paywall Screen

Update `app/paywall.tsx`:

```typescript
import { View, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useEffect } from "react";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { useSubscriptionStore } from "@/lib/store/subscription";
import { StarField } from "@/components/tarot/StarField";

export default function PaywallScreen() {
  const {
    isInitialized,
    offerings,
    isLoading,
    error,
    purchasePackage,
    restorePurchases,
    initialize,
  } = useSubscriptionStore();

  useEffect(() => {
    initialize();
  }, []);

  const handlePurchase = async (identifier: string) => {
    const pkg = offerings?.availablePackages.find(
      (p) => p.identifier === identifier
    );
    if (pkg) {
      const success = await purchasePackage(pkg);
      if (success) {
        router.back();
      }
    }
  };

  const handleRestore = async () => {
    const success = await restorePurchases();
    if (success) {
      router.back();
    }
  };

  if (!isInitialized) {
    return (
      <View className="flex-1 bg-nebula items-center justify-center">
        <ActivityIndicator color="#C9A962" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-nebula">
      <StarField starCount={30} />
      <SafeAreaView className="flex-1">
        <View className="flex-1 px-6 pt-8">
          {/* Close button */}
          <Pressable
            onPress={() => router.back()}
            className="absolute top-4 right-4 z-10 p-2"
          >
            <Text className="text-text-secondary text-2xl">×</Text>
          </Pressable>

          {/* Header */}
          <Animated.View entering={FadeIn.duration(600)} className="items-center mt-8">
            <Text variant="heading" className="text-center">
              Unlock Full Readings
            </Text>
            <Text variant="oracleItalic" className="text-text-secondary text-center mt-3">
              Access 3-card and 5-card spreads
            </Text>
          </Animated.View>

          {/* Features */}
          <Animated.View entering={FadeInDown.delay(200).duration(600)} className="mt-10">
            {[
              "Unlimited 3-card readings",
              "Unlimited 5-card readings",
              "Deeper synthesis interpretations",
              "Extended oracle messages",
            ].map((feature, i) => (
              <View key={i} className="flex-row items-center gap-3 mb-4">
                <Text className="text-gold">✦</Text>
                <Text variant="body" className="text-text-primary">
                  {feature}
                </Text>
              </View>
            ))}
          </Animated.View>

          {/* Packages */}
          <Animated.View entering={FadeInDown.delay(400).duration(600)} className="mt-8 gap-3">
            {offerings?.availablePackages.map((pkg) => (
              <Pressable
                key={pkg.identifier}
                onPress={() => handlePurchase(pkg.identifier)}
                disabled={isLoading}
                className="bg-surface border border-gold-dim rounded-2xl p-4"
              >
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text variant="body" className="text-text-primary font-sans-medium">
                      {pkg.product.title}
                    </Text>
                    <Text variant="caption" className="mt-1">
                      {pkg.product.description}
                    </Text>
                  </View>
                  <Text variant="subheading">
                    {pkg.product.priceString}
                  </Text>
                </View>
              </Pressable>
            ))}
          </Animated.View>

          {/* Error */}
          {error && (
            <Text variant="caption" className="text-error text-center mt-4">
              {error}
            </Text>
          )}

          {/* Spacer */}
          <View className="flex-1" />

          {/* Restore */}
          <Animated.View entering={FadeInDown.delay(600).duration(600)} className="mb-6">
            <Pressable onPress={handleRestore} disabled={isLoading}>
              <Text variant="caption" className="text-center text-text-secondary">
                Already purchased? Restore purchases
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}
```

---

## NEXT STEPS AFTER PHASES 0-4

After completing these phases:

1. **Add card images**: Place 78 PNG files (540x1018) in `assets/cards/`
2. **Compile card data**: Convert YAML files to `data/cards.json`
3. **Build reading screen**: Implement progressive reveal UI
4. **Create card drawing animation**: Shuffle and reveal sequence
5. **Polish and test**: Refinements, edge cases, performance
6. **App Store assets**: Screenshots, descriptions, icons
7. **Submit to stores**: TestFlight, Play Console internal testing

---

## QUICK REFERENCE COMMANDS

```bash
# Development
npx expo start                    # Start Metro bundler
npx expo start --clear            # Clear cache and start
npx expo run:ios                  # Run on iOS Simulator
npx expo run:android              # Run on Android Emulator

# EAS Builds
eas build --profile development --platform ios     # Dev build iOS
eas build --profile development --platform android # Dev build Android
eas build --profile preview --platform all         # Preview builds
eas build --profile production --platform all      # Production builds

# Local builds
eas build --profile development --platform android --local  # Local APK

# Supabase
supabase functions deploy reading                   # Deploy edge function
supabase functions serve reading --env-file .env.local  # Local testing

# Utilities
npx expo-doctor                   # Check for issues
npx expo install --fix            # Fix dependency versions
```
