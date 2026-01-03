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
  textClassName?: string;
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
  textClassName = "",
  ...props
}: Props) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withTiming(0.95, { duration: 50 });
    opacity.value = withTiming(0.85, { duration: 50 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 100 });
    opacity.value = withTiming(1, { duration: 100 });
  };

  const isDisabled = disabled || loading;

  return (
    <AnimatedPressable
      style={animatedStyle}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={isDisabled}
      className={`py-4 px-8 rounded-2xl items-center justify-center ${variantClasses[variant]} ${isDisabled ? "opacity-50" : ""
        }`}
      {...props}
    >
      <Text
        variant="label"
        className={`text-base ${textClasses[variant]} ${textClassName}`}
      >
        {loading ? "..." : children}
      </Text>
    </AnimatedPressable>
  );
}
