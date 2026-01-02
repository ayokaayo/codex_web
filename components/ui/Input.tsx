import { TextInput, TextInputProps, View } from "react-native";
import { Text } from "./Text";
import { useState } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

interface Props extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, onFocus, onBlur, ...props }: Props) {
  const [isFocused, setIsFocused] = useState(false);
  const borderOpacity = useSharedValue(0);

  const animatedBorderStyle = useAnimatedStyle(() => ({
    borderColor: `rgba(201, 169, 98, ${borderOpacity.value})`,
  }));

  const handleFocus = (e: any) => {
    setIsFocused(true);
    borderOpacity.value = withTiming(1, { duration: 200 });
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    borderOpacity.value = withTiming(0.3, { duration: 200 });
    onBlur?.(e);
  };

  return (
    <View>
      {label && (
        <Text variant="label" className="mb-2">
          {label}
        </Text>
      )}
      <Animated.View
        style={[animatedBorderStyle]}
        className="bg-surface rounded-2xl border border-surface"
      >
        <TextInput
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor="#5A5A5A"
          className="p-4 text-base text-text-primary min-h-[100px]"
          style={{ textAlignVertical: "top", fontFamily: "EBGaramond-Regular" }}
          {...props}
        />
      </Animated.View>
      {error && (
        <Text variant="caption" className="text-error mt-2">
          {error}
        </Text>
      )}
    </View>
  );
}
