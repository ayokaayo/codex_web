import { useEffect, useMemo } from "react";
import { Dimensions, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  runOnJS,
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
    size: Math.random() * 1.5 + 0.2,
    delay: Math.random() * 4000,
    duration: Math.random() * 5000 + 4000,
    baseOpacity: Math.random() * 0.3 + 0.2,
  }));
}

function StarPoint({ star }: { star: Star }) {
  const opacity = useSharedValue(star.baseOpacity);
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    // Twinkle effect (Opacity + Scale)
    const sparkleDuration = star.duration;

    opacity.value = withDelay(
      star.delay,
      withRepeat(
        withTiming(1, { // Peak opacity
          duration: sparkleDuration,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      )
    );

    scale.value = withDelay(
      star.delay,
      withRepeat(
        withTiming(1.4, { // Peak scale
          duration: sparkleDuration,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      )
    );

    // Slow drifting movement (simulating living sky)
    const moveDuration = star.duration * 8; // Much slower than twinkling
    const wanderRange = 100; // Pixels to wander

    translateX.value = withDelay(
      star.delay,
      withRepeat(
        withTiming((Math.random() - 0.5) * wanderRange, {
          duration: moveDuration,
          easing: Easing.inOut(Easing.sin),
        }),
        -1,
        true
      )
    );

    translateY.value = withDelay(
      star.delay,
      withRepeat(
        withTiming((Math.random() - 0.5) * wanderRange, {
          duration: moveDuration,
          easing: Easing.inOut(Easing.sin),
        }),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value }
    ],
    position: "absolute",
    left: star.x,
    top: star.y,
    width: star.size,
    height: star.size,
    borderRadius: star.size / 2,
    backgroundColor: "#E8E6E3",
    shadowColor: "#FFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  }));

  return <Animated.View style={animatedStyle} />;
}

import { LinearGradient } from "expo-linear-gradient";

function ShootingStar({ minDelay = 10000, maxDelay = 25000, triggerImmediately = false }: { minDelay?: number, maxDelay?: number, triggerImmediately?: boolean }) {
  const translateX = useSharedValue(SCREEN_WIDTH / 2);
  const translateY = useSharedValue(SCREEN_HEIGHT / 2);
  const opacity = useSharedValue(0);
  const rotation = useSharedValue(-45);
  const scale = useSharedValue(1);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let isMounted = true;

    const animate = () => {
      if (!isMounted) return;

      // Pick start position - right side of screen, upper portion
      const startX = SCREEN_WIDTH * 0.7 + Math.random() * (SCREEN_WIDTH * 0.2);
      const startY = Math.random() * (SCREEN_HEIGHT * 0.3) + 50;

      // Calculate end position (diagonal down-left)
      const travelDist = 400 + Math.random() * 300;
      const endX = startX - travelDist;
      const endY = startY + travelDist * 0.8;

      // Calculate angle
      const angleRad = Math.atan2(endY - startY, endX - startX);
      const angleDeg = angleRad * (180 / Math.PI);
      rotation.value = angleDeg;

      // Animate from start to end with timing
      const duration = 1500; // Slightly faster for a "zip" feel, or keep 1800

      translateX.value = withSequence(
        withTiming(startX, { duration: 0 }),
        withTiming(endX, { duration, easing: Easing.out(Easing.cubic) }) // Cubic easing for natural slow-down
      );

      translateY.value = withSequence(
        withTiming(startY, { duration: 0 }),
        withTiming(endY, { duration, easing: Easing.out(Easing.cubic) })
      );

      // Fade out logic
      opacity.value = withSequence(
        withTiming(1, { duration: 0 }),
        withDelay(
          duration * 0.4,
          withTiming(0, {
            duration: duration * 0.6,
          }, (finished) => {
            if (finished && isMounted) {
              runOnJS(scheduleNext)();
            }
          })
        )
      );

      // Slight scale down effect at end
      scale.value = withSequence(
        withTiming(1, { duration: 0 }),
        withTiming(0.5, { duration: duration })
      );
    };

    const scheduleNext = () => {
      if (!isMounted) return;
      const nextDelay = Math.random() * (maxDelay - minDelay) + minDelay;
      console.log('Next shooting star in:', nextDelay);
      timeout = setTimeout(animate, nextDelay);
    };

    // Start first animation
    const initialDelay = triggerImmediately ? 1000 : (Math.random() * minDelay);
    timeout = setTimeout(animate, initialDelay);

    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, [minDelay, maxDelay, triggerImmediately]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
      { scale: scale.value }
    ],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          left: 0,
          top: 0,
          width: 150, // Longer tail
          height: 1, // Ultra thin
          shadowColor: "#FFF",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 2,
        },
        animatedStyle,
      ]}
    >
      <LinearGradient
        colors={['rgba(255,255,255,1)', 'rgba(255,255,255,0)']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{ flex: 1, borderRadius: 1 }}
      />
    </Animated.View>
  );
}

interface Props {
  starCount?: number;
  shootingStars?: boolean;
}

export function StarField({ starCount = 23, shootingStars = true }: Props) {
  const stars = useMemo(() => generateStars(starCount), [starCount]);

  return (
    <View
      className="absolute inset-0 overflow-hidden"
      pointerEvents="none"
    >
      {stars.map((star) => (
        <StarPoint key={star.id} star={star} />
      ))}
      {shootingStars && (
        <>
          <ShootingStar minDelay={120000} maxDelay={240000} triggerImmediately />
          <ShootingStar minDelay={150000} maxDelay={270000} />
        </>
      )}
    </View>
  );
}
