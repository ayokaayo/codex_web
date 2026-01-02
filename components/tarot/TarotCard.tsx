import { View, Image, Pressable, Dimensions } from "react-native";
import { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  Easing,
  FadeIn,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Text } from "../ui/Text";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Card aspect ratio based on provided dimensions: 540x1018
const CARD_ASPECT_RATIO = 540 / 1018;

interface Props {
  name: string;
  image: any; // require() image or { uri: string }
  isRevealed?: boolean;
  size?: "small" | "medium" | "large";
  onPress?: () => void;
  showName?: boolean;
}

const sizeConfig = {
  small: { width: SCREEN_WIDTH * 0.22 },
  medium: { width: SCREEN_WIDTH * 0.35 },
  large: { width: SCREEN_WIDTH * 0.55 },
};

export function TarotCard({
  name,
  image,
  isRevealed = false,
  size = "medium",
  onPress,
  showName = true,
}: Props) {
  const rotateY = useSharedValue(isRevealed ? 0 : 180);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isRevealed) {
      // Trigger reveal animation
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      rotateY.value = withTiming(0, {
        duration: 800,
        easing: Easing.inOut(Easing.ease),
      });
    } else {
      // Reset to face down
      rotateY.value = 180;
    }
  }, [isRevealed]);

  const cardWidth = sizeConfig[size].width;
  const cardHeight = cardWidth / CARD_ASPECT_RATIO;

  const frontStyle = useAnimatedStyle(() => {
    const rotate = interpolate(rotateY.value, [0, 180], [0, 180]);
    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotate}deg` },
        { scale: scale.value },
      ],
      backfaceVisibility: "hidden",
    };
  });

  const backStyle = useAnimatedStyle(() => {
    const rotate = interpolate(rotateY.value, [0, 180], [180, 360]);
    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotate}deg` },
        { scale: scale.value },
      ],
      backfaceVisibility: "hidden",
    };
  });

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress();
    }
  };

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const reveal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    rotateY.value = withTiming(0, {
      duration: 800,
      easing: Easing.inOut(Easing.ease),
    });
  };

  return (
    <View className="items-center">
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={{ width: cardWidth, height: cardHeight }}>
          {/* Card Back */}
          <Animated.View
            style={[
              {
                position: "absolute",
                width: cardWidth,
                height: cardHeight,
              },
              backStyle,
            ]}
          >
            <View className="flex-1 bg-nebula rounded-xl border border-gold-dim items-center justify-center">
              {/* Simple back design */}
              <View className="w-12 h-12 border-2 border-gold-muted rounded-full items-center justify-center">
                <Animated.Text
                  style={{ fontFamily: "Cinzel-Regular" }}
                  className="text-gold-muted text-lg"
                >
                  ✦
                </Animated.Text>
              </View>
            </View>
          </Animated.View>

          {/* Card Front */}
          <Animated.View
            style={[
              {
                position: "absolute",
                width: cardWidth,
                height: cardHeight,
              },
              frontStyle,
            ]}
          >
            <Image
              source={image}
              style={{
                width: cardWidth,
                height: cardHeight,
                borderRadius: 12,
              }}
              resizeMode="cover"
            />
          </Animated.View>
        </View>
      </Pressable>

      {/* Card Name */}
      {showName && isRevealed && (
        <Animated.View
          entering={FadeIn.delay(400).duration(500)}
          className="mt-3"
        >
          <Text variant="caption" className="text-center text-gold">
            {name}
          </Text>
        </Animated.View>
      )}
    </View>
  );
}
