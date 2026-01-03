import { Pressable, PressableProps, ActivityIndicator, View } from "react-native";
import { Text } from "./Text";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Variant = "primary" | "secondary" | "ghost";

interface Props extends Omit<PressableProps, "children"> {
  variant?: Variant;
  children: string;
  loading?: boolean;
  textClassName?: string;
  fullWidth?: boolean;
}

// Active button styles
const variantClasses: Record<Variant, string> = {
  primary: "bg-gold",
  secondary: "bg-surface border border-gold-muted",
  ghost: "bg-transparent",
};

// Disabled button styles - more subtle and muted
const disabledVariantClasses: Record<Variant, string> = {
  primary: "bg-gold-dim",
  secondary: "bg-surface/50 border border-surface",
  ghost: "bg-transparent",
};

const textClasses: Record<Variant, string> = {
  primary: "text-void",
  secondary: "text-gold",
  ghost: "text-text-secondary",
};

const disabledTextClasses: Record<Variant, string> = {
  primary: "text-void/60",
  secondary: "text-gold-dim",
  ghost: "text-text-muted",
};

// Loading indicator colors
const loaderColors: Record<Variant, string> = {
  primary: "#0A0A0F",
  secondary: "#C9A962",
  ghost: "#8A8A8A",
};

export function Button({
  variant = "primary",
  children,
  disabled,
  loading,
  onPress,
  textClassName = "",
  fullWidth = false,
  ...props
}: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (loading || disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withTiming(0.97, { duration: 80 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 120 });
  };

  const isDisabled = disabled || loading;
  const baseClasses = isDisabled ? disabledVariantClasses[variant] : variantClasses[variant];
  const textClass = isDisabled ? disabledTextClasses[variant] : textClasses[variant];

  return (
    <AnimatedPressable
      style={animatedStyle}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={isDisabled}
      className={`py-4 px-8 rounded-2xl items-center justify-center ${baseClasses} ${fullWidth ? "w-full" : ""}`}
      {...props}
    >
      {loading ? (
        <View className="flex-row items-center justify-center">
          <ActivityIndicator color={loaderColors[variant]} size="small" />
        </View>
      ) : (
        <Text
          variant="label"
          className={`text-base ${textClass} ${textClassName}`}
        >
          {children}
        </Text>
      )}
    </AnimatedPressable>
  );
}

