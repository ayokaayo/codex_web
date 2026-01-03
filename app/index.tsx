import { View, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform, Image, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useRef, useState, useCallback } from "react";
import React from "react";
import { router, useFocusEffect } from "expo-router";
import Animated, { FadeIn, FadeInDown, useSharedValue, useAnimatedStyle, withTiming, runOnJS, interpolateColor, FadeOut } from "react-native-reanimated";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { MenuModal } from "@/components/ui/MenuModal";
import { StarField } from "@/components/tarot/StarField";
import { NebulaLayer } from "@/components/tarot/NebulaLayer";
import { FogLayer } from "@/components/tarot/FogLayer";
import { useSubscriptionStore } from "@/lib/store/subscription";
import { useReadingStore } from "@/lib/store/reading";
import { useUsageStore } from "@/lib/store/usage";
import * as Haptics from "expo-haptics";
import { Menu, Lock } from "lucide-react-native";

type SpreadType = "single" | "three" | "five";

const spreadOptions: { type: SpreadType; label: string; cards: number; free: boolean }[] = [
  { type: "single", label: "1", cards: 1, free: true },
  { type: "three", label: "3", cards: 3, free: false },
  { type: "five", label: "5", cards: 5, free: false },
];

export default function HomeScreen() {
  const [intention, setIntention] = useState("");
  const [spreadType, setSpreadType] = useState<SpreadType>("single");
  const [isLoading, setIsLoading] = useState(false);

  // Controls whether background components are mounted (for performance)
  const [showBackground, setShowBackground] = useState(false);

  // Menu modal visibility
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { isProUser } = useSubscriptionStore();
  const resetReading = useReadingStore((state) => state.reset);

  // Usage tracking for free tier limits
  const { fetchUsage, canUseSpread, getRemainingReadings } = useUsageStore();

  // Background opacity for fade effects
  const backgroundOpacity = useSharedValue(0);

  // Input focus state for animated border
  const inputFocusProgress = useSharedValue(0);

  const inputAnimatedStyle = useAnimatedStyle(() => ({
    borderWidth: 1,
    borderColor: interpolateColor(
      inputFocusProgress.value,
      [0, 1],
      ["rgba(26, 26, 36, 1)", "rgba(201, 169, 98, 0.8)"]
    ),
    shadowColor: "#C9A962",
    shadowOpacity: inputFocusProgress.value * 0.25,
    shadowRadius: inputFocusProgress.value * 10,
    shadowOffset: { width: 0, height: 0 },
  }));

  const handleInputFocus = () => {
    inputFocusProgress.value = withTiming(1, { duration: 250 });
  };

  const handleInputBlur = () => {
    inputFocusProgress.value = withTiming(0, { duration: 200 });
  };

  const selectedSpread = spreadOptions.find((s) => s.type === spreadType)!;

  // Check if current spread selection is locked (free tier exhausted)
  const isSpreadLocked = !selectedSpread.free && !isProUser && !canUseSpread(spreadType);

  // Animated opacity for locked message (smooth crossfade)
  const lockedOpacity = useSharedValue(isSpreadLocked ? 1 : 0);
  const unlockedOpacity = useSharedValue(isSpreadLocked ? 0 : 1);

  // Smoothly transition between locked/unlocked states
  React.useEffect(() => {
    if (isSpreadLocked) {
      // Reset focus when locking (removes gold border)
      inputFocusProgress.value = withTiming(0, { duration: 200 });
      // Fade out input, fade in locked message
      unlockedOpacity.value = withTiming(0, { duration: 200 });
      lockedOpacity.value = withTiming(1, { duration: 350 });
    } else {
      // Fade out locked message, fade in input
      lockedOpacity.value = withTiming(0, { duration: 200 });
      unlockedOpacity.value = withTiming(1, { duration: 350 });
    }
  }, [isSpreadLocked]);

  const lockedAnimatedStyle = useAnimatedStyle(() => ({
    opacity: lockedOpacity.value,
  }));

  const unlockedAnimatedStyle = useAnimatedStyle(() => ({
    opacity: unlockedOpacity.value,
  }));

  const handleMenuPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsMenuOpen(true);
  };

  // Fade in when screen comes into focus - delayed to let navigation complete first
  useFocusEffect(
    useCallback(() => {
      // Mount background components first
      setShowBackground(true);

      // Fetch usage data for free tier limits (only if not pro)
      if (!isProUser) {
        fetchUsage();
      }

      // Then start fade-in animation after a brief delay for smoother transition
      const timer = setTimeout(() => {
        backgroundOpacity.value = withTiming(1, { duration: 800 });
      }, 100);

      return () => {
        clearTimeout(timer);
      };
    }, [isProUser])
  );

  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
  }));

  const handleSpreadSelect = (type: SpreadType) => {
    Haptics.selectionAsync();
    setSpreadType(type);
  };

  const navigateToReading = () => {
    // Unmount background components to stop all animations (performance)
    setShowBackground(false);

    // Navigate immediately for snappy response
    router.push({
      pathname: "/reading/[id]",
      params: {
        id: Date.now().toString(),
        intention,
        spreadType,
      },
    });

    // Reset loading state after navigation starts
    setIsLoading(false);
  };

  const handleDrawCards = async () => {
    // If spread is locked, go to paywall
    if (isSpreadLocked) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.push("/paywall");
      return;
    }

    if (!intention.trim()) return;

    // Reset previous reading state
    resetReading();

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Fade out background before navigating
    backgroundOpacity.value = withTiming(0, { duration: 600 }, (finished) => {
      if (finished) {
        runOnJS(navigateToReading)();
      }
    });
  };

  return (
    <View className="flex-1 bg-void">
      {/* Background Layer with Fade Animation - conditionally rendered for performance */}
      {showBackground && (
        <Animated.View style={[StyleSheet.absoluteFill, backgroundAnimatedStyle]} pointerEvents="none">
          <StarField starCount={70} />
          <NebulaLayer />
          <FogLayer />
        </Animated.View>
      )}

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
            <View className="flex-1 px-6 pt-6 pb-8">
              {/* Header */}
              <Animated.View entering={FadeIn.duration(500)} className="flex-row justify-between items-center py-2 mb-2">
                <Image
                  source={require("../assets/brand/codex_logo_w.png")}
                  style={{ width: 150, height: 40, marginLeft: -12 }}
                  resizeMode="contain"
                />
                <Pressable onPress={handleMenuPress} className="p-2">
                  <Menu color="#C9A962" size={28} />
                </Pressable>
              </Animated.View>

              {/* Spacer to push content to bottom */}
              <View className="flex-1" />

              {/* Spread Selection */}
              <Animated.View entering={FadeInDown.delay(100).duration(500)} className="mb-6 px-4">
                <Text variant="label" className="mb-4 text-center text-xl font-cinzel-extrabold text-gold-bright tracking-widest leading-relaxed">
                  Select how many cards
                </Text>
                <View className="flex-row justify-between gap-4">
                  {spreadOptions.map((option) => (
                    <Pressable
                      key={option.type}
                      onPress={() => handleSpreadSelect(option.type)}
                      className={`flex-1 h-32 rounded-2xl border items-center justify-center ${spreadType === option.type
                        ? "bg-surface border-gold"
                        : "bg-surface border-surface"
                        }`}
                    >
                      <Text
                        style={{ fontFamily: 'Cinzel-ExtraBold', fontVariant: ['tabular-nums'] }}
                        className={`text-7xl text-center pt-2 ${spreadType === option.type ? "text-gold-bright" : "text-text-secondary opacity-50"
                          }`}
                      >
                        {option.label}
                      </Text>
                      {/* Show padlock only if: not free tier AND (pro user OR free tier exhausted) */}
                      {!option.free && !isProUser && !canUseSpread(option.type) && (
                        <View className="absolute top-2 right-2 bg-gold/20 p-1.5 rounded-full">
                          <Lock size={12} color="#C9A962" />
                        </View>
                      )}
                      {/* Show remaining count for free users who still have readings */}
                      {!option.free && !isProUser && canUseSpread(option.type) && (
                        <View className="absolute top-2 right-2 bg-gold/20 px-2 py-1 rounded-full">
                          <Text className="text-gold text-xs font-sans-medium">
                            {getRemainingReadings(option.type as "three" | "five")} left
                          </Text>
                        </View>
                      )}
                    </Pressable>
                  ))}
                </View>
              </Animated.View>

              {/* Intention Input - single container, content crossfades inside */}
              <Animated.View
                entering={FadeInDown.delay(200).duration(500)}
                className="mb-6"
              >
                <Animated.View
                  style={inputAnimatedStyle}
                  className="bg-surface rounded-2xl min-h-[180px] overflow-hidden"
                >
                  {/* Locked message content - fades in/out */}
                  <Animated.View
                    style={[lockedAnimatedStyle, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', padding: 24 }]}
                    pointerEvents={isSpreadLocked ? 'auto' : 'none'}
                  >
                    <Lock size={32} color="#C9A962" style={{ marginBottom: 12 }} />
                    <Text className="text-text-muted text-center text-lg">
                      You've used all your free {spreadType === "three" ? "3-card" : "5-card"} readings this month
                    </Text>
                  </Animated.View>

                  {/* Input content - fades in/out */}
                  <Animated.View
                    style={[unlockedAnimatedStyle]}
                    pointerEvents={isSpreadLocked ? 'none' : 'auto'}
                  >
                    <TextInput
                      value={intention}
                      onChangeText={setIntention}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                      placeholder="What questions or situation needs clarity?"
                      placeholderTextColor="#5A5A5A"
                      multiline
                      numberOfLines={5}
                      maxLength={500}
                      editable={!isSpreadLocked}
                      className="p-6 text-2xl text-text-primary min-h-[180px]"
                      style={{ textAlignVertical: "top", fontFamily: "EBGaramond-Regular" }}
                    />
                  </Animated.View>
                </Animated.View>
              </Animated.View>

              {/* Draw Button - changes to unlock button when spread is locked */}
              <Animated.View entering={FadeInDown.delay(300).duration(500)}>
                <Button
                  variant="primary"
                  disabled={!isSpreadLocked && !intention.trim()}
                  loading={isLoading}
                  onPress={handleDrawCards}
                  textClassName="text-xl tracking-widest"
                >
                  {isSpreadLocked ? "UNLOCK FULL READINGS" : "DRAW CARDS"}
                </Button>
              </Animated.View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Settings Menu Modal */}
      <MenuModal visible={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </View>
  );
}
