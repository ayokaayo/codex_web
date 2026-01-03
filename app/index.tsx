import { View, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { router } from "expo-router";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { StarField } from "@/components/tarot/StarField";
import { NebulaLayer } from "@/components/tarot/NebulaLayer";
import { FogLayer } from "@/components/tarot/FogLayer";
import { useSubscriptionStore } from "@/lib/store/subscription";
import { useReadingStore } from "@/lib/store/reading";
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
      <NebulaLayer />
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
            <View className="flex-1 px-6 pt-6 pb-8">
              {/* Header */}
              <Animated.View entering={FadeIn.duration(500)} className="flex-row justify-between items-center py-2 mb-2">
                <Image
                  source={require("../assets/brand/codex_logo_w.png")}
                  style={{ width: 150, height: 40, marginLeft: -12 }}
                  resizeMode="contain"
                />
                <Pressable onPress={() => { }} className="p-2">
                  <Menu color="#C9A962" size={32} />
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
                        ? "bg-gold/10 border-gold"
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
                      {!option.free && (
                        <View className="absolute top-2 right-2 bg-gold/20 p-1.5 rounded-full">
                          <Lock size={12} color="#C9A962" />
                        </View>
                      )}
                    </Pressable>
                  ))}
                </View>
              </Animated.View>

              {/* Intention Input */}
              <Animated.View entering={FadeInDown.delay(200).duration(500)} className="mb-6">
                <TextInput
                  value={intention}
                  onChangeText={setIntention}
                  placeholder="What questions or situation needs clarity?"
                  placeholderTextColor="#5A5A5A"
                  multiline
                  numberOfLines={5}
                  maxLength={500}
                  className="bg-surface border border-surface rounded-2xl p-6 text-2xl text-text-primary min-h-[180px]"
                  style={{ textAlignVertical: "top", fontFamily: "EBGaramond-Regular" }}
                />
              </Animated.View>

              {/* Draw Button */}
              <Animated.View entering={FadeInDown.delay(300).duration(500)}>
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
