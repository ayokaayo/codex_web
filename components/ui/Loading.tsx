import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
  FadeIn,
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
          entering={FadeIn.duration(500)}
          className="text-2xl text-text-secondary"
          style={{ fontFamily: "EBGaramond-Italic" }}
        >
          The cards are speaking...
        </Animated.Text>
      </View>
    </View>
  );
}
