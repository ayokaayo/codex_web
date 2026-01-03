import { TextInput, TextInputProps, View } from "react-native";
import { Text } from "./Text";
import { useState } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from "react-native-reanimated";

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  showCharacterCount?: boolean;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export function Input({
  label,
  error,
  onFocus,
  onBlur,
  showCharacterCount = false,
  maxLength,
  value,
  ...props
}: Props) {
  const [isFocused, setIsFocused] = useState(false);
  const focusProgress = useSharedValue(0);

  const animatedBorderStyle = useAnimatedStyle(() => {
    return {
      borderColor: interpolateColor(
        focusProgress.value,
        [0, 1],
        ["rgba(26, 26, 36, 1)", "rgba(201, 169, 98, 0.8)"]
      ),
      // Subtle shadow glow on focus (works on iOS)
      shadowColor: "#C9A962",
      shadowOpacity: focusProgress.value * 0.3,
      shadowRadius: focusProgress.value * 8,
      shadowOffset: { width: 0, height: 0 },
    };
  });

  const handleFocus = (e: any) => {
    setIsFocused(true);
    focusProgress.value = withTiming(1, { duration: 250 });
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    focusProgress.value = withTiming(0, { duration: 200 });
    onBlur?.(e);
  };

  const currentLength = value?.length || 0;

  return (
    <View>
      {label && (
        <Text variant="label" className="mb-2">
          {label}
        </Text>
      )}
      <AnimatedView
        style={[animatedBorderStyle]}
        className="bg-surface rounded-2xl border"
      >
        <TextInput
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor="#5A5A5A"
          className="p-4 text-base text-text-primary min-h-[100px]"
          style={{ textAlignVertical: "top", fontFamily: "EBGaramond-Regular" }}
          maxLength={maxLength}
          value={value}
          {...props}
        />
      </AnimatedView>

      {/* Footer: Error or Character Count */}
      <View className="flex-row justify-between mt-2">
        {error ? (
          <Text variant="caption" className="text-error">
            {error}
          </Text>
        ) : (
          <View />
        )}
        {showCharacterCount && maxLength && (
          <Text
            variant="caption"
            className={currentLength >= maxLength ? "text-gold-muted" : "text-text-muted"}
          >
            {currentLength}/{maxLength}
          </Text>
        )}
      </View>
    </View>
  );
}

