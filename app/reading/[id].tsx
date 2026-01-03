import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { StarField } from "@/components/tarot/StarField";
import { NebulaLayer } from "@/components/tarot/NebulaLayer";
import { FogLayer } from "@/components/tarot/FogLayer";
import { ReadingLoader } from "@/components/ui/Loading";
import { TarotCard } from "@/components/tarot/TarotCard";
import { useReading } from "@/lib/hooks/useReading";
import { drawCards } from "@/lib/utils/deck";

// Fallback image if card image not found
const FALLBACK_IMAGE = require("../../assets/favicon.png");

// Wrapper to handle flip animation
function DelayedRevealCard({ card, image, delay, showName = true }: { card: string; image: any; delay: number; showName?: boolean }) {
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsRevealed(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <TarotCard
      name={card}
      image={image}
      isRevealed={isRevealed}
      size="medium"
      showName={showName}
    />
  );
}

export default function ReadingScreen() {
  const { id, intention, spreadType } = useLocalSearchParams<{
    id: string;
    intention: string;
    spreadType: "single" | "three" | "five";
  }>();

  const {
    status,
    opening,
    cardAnalyses,
    synthesis,
    oracle,
    error,
    selectedCards,
    generateReading,
    reset,
  } = useReading();

  const scrollViewRef = useRef<ScrollView>(null);
  const hasStartedReading = useRef(false);

  useEffect(() => {
    // Guard: only run once
    if (hasStartedReading.current) return;

    if (intention && spreadType) {
      hasStartedReading.current = true;
      // Draw real cards from the deck
      const count = spreadType === "single" ? 1 : spreadType === "three" ? 3 : 5;
      const drawnCards = drawCards(count);
      generateReading(intention, spreadType, drawnCards);
    }

    return () => {
      // Only reset on unmount, not on every re-render
    };
  }, [intention, spreadType]);

  // Auto-scroll as content arrives
  useEffect(() => {
    if (status === "complete" || synthesis) {
      // setTimeout(() => {
      //   scrollViewRef.current?.scrollToEnd({ animated: true });
      // }, 500);
    }
  }, [status, synthesis, oracle]);

  return (
    <View className="flex-1 bg-void">
      <StarField starCount={40} shootingStars={false} />
      <NebulaLayer />
      <FogLayer />

      <SafeAreaView className="flex-1">
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
          className="px-6"
        >
          {/* Header */}
          <Animated.View
            entering={FadeIn.duration(600)}
            className="items-center py-2 border-b border-surface"
          >
            <Text variant="heading" className="text-center">
              Your Reading
            </Text>
            <Text variant="oracleItalic" className="text-text-secondary text-center mt-1 text-3xl">
              "{intention}"
            </Text>
          </Animated.View>

          {/* Opening - only show if exists */}
          {opening && (
            <Animated.View
              entering={FadeInDown.duration(600)}
              className="mt-4 mb-4 px-2"
            >
              <Text variant="oracle" className="italic leading-relaxed">
                {opening}
              </Text>
            </Animated.View>
          )}

          {/* Cards & Analysis Loop */}
          <View className="gap-12 mt-4">
            {cardAnalyses?.map((analysis, index) => (
              <Animated.View
                key={index}
                entering={FadeInDown.delay(index * 1200).duration(800)}
                className="items-center gap-6"
              >
                {/* Position Label */}
                <Text variant="label" className="text-gold text-xl">
                  {analysis.position}
                </Text>

                {/* Card Name - Moved here, revealed with same timing as analysis start */}
                <Animated.View entering={FadeIn.delay(index * 1200 + 800).duration(500)}>
                  <Text
                    variant="caption"
                    className="text-center text-gold-muted -mt-4 mb-2 text-base"
                    style={{ fontFamily: 'Cinzel-Bold' }}
                  >
                    {analysis.card}
                  </Text>
                </Animated.View>

                {/* Card Display with Flip */}
                <DelayedRevealCard
                  card={analysis.card}
                  image={selectedCards[index]?.image || FALLBACK_IMAGE}
                  delay={800} // Flip 0.8s after entering
                  showName={false}
                />

                {/* Analysis Text - Reverted to plain text */}
                <Animated.View
                  entering={FadeIn.delay(2000).duration(800)}
                >
                  <Text variant="body" className="leading-relaxed">
                    {analysis.analysis}
                  </Text>
                </Animated.View>

                {/* Divider (except last) */}
                {index < cardAnalyses.length - 1 && (
                  <View className="w-12 h-[1px] bg-gold-dim opacity-30 my-4" />
                )}
              </Animated.View>
            ))}
          </View>

          {/* Loaders for Progressive States */}
          {status === "analyzing" && (
            <View className="mt-12 items-center">
              <ReadingLoader />
            </View>
          )}

          {/* Synthesis - Container applied here */}
          {synthesis && (
            <Animated.View
              entering={FadeInDown.duration(800)}
              className="mt-16 p-6 bg-surface/50 rounded-2xl border border-gold-dim/20"
            >
              <Text variant="subheading" className="text-left mb-6 text-gold-bright text-2xl font-cinzel-extrabold">
                What this reading means
              </Text>
              <Text variant="body" className="leading-relaxed">
                {synthesis}
              </Text>
            </Animated.View>
          )}

          {status === "synthesizing" && (
            <View className="mt-8 items-center">
              <ReadingLoader />
            </View>
          )}

          {/* Oracle - Container applied here */}
          {oracle && (
            <Animated.View
              entering={FadeInDown.delay(500).duration(1000)}
              className="mt-16 gap-4 bg-surface/50 rounded-2xl border border-gold-dim/20 p-6"
            >
              <Text variant="subheading" className="text-left mb-2 text-gold-bright text-2xl font-cinzel-extrabold">
                The tarot's voice
              </Text>
              <Text variant="body" className="text-left leading-relaxed">
                {oracle}
              </Text>
              <Text className="text-2xl text-gold text-left">✦</Text>
            </Animated.View>
          )}

          {status === "oracle" && (
            <View className="mt-8 items-center">
              <ReadingLoader />
            </View>
          )}

          {/* Completion - Done Button */}
          {status === "complete" && (
            <Animated.View
              entering={FadeIn.delay(1000).duration(600)}
              className="mt-16 mb-8"
            >
              <Button
                onPress={() => router.replace("/")}
                variant="primary"
                textClassName="text-xl font-bold tracking-widest"
              >
                NEW READING
              </Button>
            </Animated.View>
          )}

          {/* Error State */}
          {error && (
            <Animated.View entering={FadeIn.duration(400)} className="mt-8 items-center">
              <Text variant="caption" className="text-error mb-4">
                {error}
              </Text>
              <Button onPress={() => reset()} variant="secondary">
                Try Again
              </Button>
            </Animated.View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
