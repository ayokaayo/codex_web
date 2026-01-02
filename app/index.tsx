import { View, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { router } from "expo-router";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { StarField } from "@/components/tarot/StarField";
import { FogLayer } from "@/components/tarot/FogLayer";
import { useSubscriptionStore } from "@/lib/store/subscription";
import { useReadingStore } from "@/lib/store/reading";
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

  const { isProUser } = useSubscriptionStore();
  const resetReading = useReadingStore((state) => state.reset);

  const selectedSpread = spreadOptions.find((s) => s.type === spreadType)!;

  const handleSpreadSelect = (type: SpreadType) => {
    Haptics.selectionAsync();
    setSpreadType(type);
  };

  const handleDrawCards = async () => {
    if (!intention.trim()) return;

    // Check if paid spread and not subscribed
    if (!selectedSpread.free && !isProUser) {
      // User needs to subscribe
      router.push("/paywall");
      return;
    }

    // Reset previous reading state
    resetReading();

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Navigate to reading screen with params
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
                  className="bg-surface border border-surface rounded-2xl p-4 text-base text-text-primary min-h-[120px]"
                  style={{ textAlignVertical: "top", fontFamily: "EBGaramond-Regular" }}
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
                      className={`flex-1 max-w-[100px] py-4 rounded-2xl border items-center ${spreadType === option.type
                        ? "bg-gold/10 border-gold"
                        : "bg-surface border-surface"
                        }`}
                    >
                      <Text
                        variant="label"
                        className={`text-sm ${spreadType === option.type ? "text-gold" : "text-text-secondary"
                          }`}
                      >
                        {option.label}
                      </Text>
                      {!option.free && (
                        <Text className="text-2xs text-purple mt-1" style={{ fontFamily: "EBGaramond-Regular" }}>
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
