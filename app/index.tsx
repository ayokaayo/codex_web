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
  { type: "single", label: "1", cards: 1, free: true },
  { type: "three", label: "3", cards: 3, free: false },
  { type: "five", label: "5", cards: 5, free: false },
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
              <Animated.View entering={FadeIn.duration(800)} className="items-center py-4">
                <Text variant="title" className="text-center pt-2 leading-relaxed">CODEX TAROT</Text>
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(200).duration(600)} className="items-center px-4">
                <Text variant="oracleItalic" className="text-text-secondary mt-4 text-center text-4xl leading-10">
                  What are you here to discover?
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
                  className="bg-surface border border-surface rounded-2xl p-6 text-2xl text-text-primary min-h-[180px]"
                  style={{ textAlignVertical: "top", fontFamily: "EBGaramond-Regular" }}
                />
              </Animated.View>

              {/* Spread Selection */}
              {/* Spread Selection */}
              <Animated.View entering={FadeInDown.delay(600).duration(600)} className="mt-12 px-4">
                <Text variant="label" className="mb-8 text-center text-xl font-cinzel-extrabold text-gold-bright tracking-widest leading-relaxed">
                  CHOOSE HOW MANY CARDS ON YOUR SPREAD
                </Text>
                <View className="flex-row justify-between gap-4">
                  {spreadOptions.map((option) => (
                    <Pressable
                      key={option.type}
                      onPress={() => handleSpreadSelect(option.type)}
                      className={`flex-1 h-32 rounded-2xl border items-center justify-center ${spreadType === option.type
                        ? "bg-gold/10 border-gold"
                        : "bg-surface border-surface"
                        }`}
                    >
                      <Text
                        style={{ fontFamily: 'Cinzel-ExtraBold', fontVariant: ['tabular-nums'] }}
                        className={`text-6xl text-center pt-4 ${spreadType === option.type ? "text-gold-bright" : "text-text-secondary opacity-50"
                          }`}
                      >
                        {option.label}
                      </Text>
                      {!option.free && (
                        <View className="absolute top-2 right-2 bg-gold/20 px-2 py-0.5 rounded">
                          <Text className="text-[10px] text-gold font-cinzel-bold tracking-widest uppercase">
                            PRO
                          </Text>
                        </View>
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
                  textClassName="text-xl font-bold tracking-widest"
                >
                  DRAW CARDS
                </Button>
              </Animated.View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
