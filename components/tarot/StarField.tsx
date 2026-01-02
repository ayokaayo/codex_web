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
