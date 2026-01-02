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
        easing: Easing.inOut(Easing.ease),
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
