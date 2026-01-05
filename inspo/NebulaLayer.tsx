import { useEffect, useMemo } from "react";
import { Dimensions, View, StyleSheet } from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
    interpolate,
    cancelAnimation,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export function NebulaLayer() {
    const progress1 = useSharedValue(0);
    const progress2 = useSharedValue(0);

    useEffect(() => {
        // Very slow breathing movement for layer 1
        progress1.value = withRepeat(
            withTiming(1, {
                duration: 40000,
                easing: Easing.inOut(Easing.ease),
            }),
            -1,
            true
        );

        // Slightly offset timing for layer 2
        progress2.value = withRepeat(
            withTiming(1, {
                duration: 50000,
                easing: Easing.inOut(Easing.ease),
            }),
            -1,
            true
        );

        return () => {
            cancelAnimation(progress1);
            cancelAnimation(progress2);
        };
    }, []);

    const nebulaStyle1 = useAnimatedStyle(() => ({
        transform: [
            { translateX: interpolate(progress1.value, [0, 1], [-SCREEN_WIDTH * 0.08, SCREEN_WIDTH * 0.08]) },
            { translateY: interpolate(progress1.value, [0, 1], [-30, 30]) },
            { scale: interpolate(progress1.value, [0, 1], [1, 1.08]) },
        ],
        opacity: interpolate(progress1.value, [0, 0.5, 1], [0.32, 0.58, 0.32]),
    }));

    const nebulaStyle2 = useAnimatedStyle(() => ({
        transform: [
            { translateX: interpolate(progress2.value, [0, 1], [SCREEN_WIDTH * 0.08, -SCREEN_WIDTH * 0.08]) },
            { translateY: interpolate(progress2.value, [0, 1], [30, -30]) },
            { scale: interpolate(progress2.value, [0, 1], [1.08, 1]) },
        ],
        opacity: interpolate(progress2.value, [0, 0.5, 1], [0.28, 0.5, 0.28]),
    }));

    const staticStyles = useMemo(() => StyleSheet.create({
        container: {
            position: "absolute" as const,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
        },
        layer1: {
            position: "absolute" as const,
            width: SCREEN_WIDTH * 1.5,
            height: SCREEN_HEIGHT * 1.2,
            top: -SCREEN_HEIGHT * 0.1,
            left: -SCREEN_WIDTH * 0.25,
        },
        layer2: {
            position: "absolute" as const,
            width: SCREEN_WIDTH * 1.5,
            height: SCREEN_HEIGHT * 1.2,
            bottom: -SCREEN_HEIGHT * 0.1,
            right: -SCREEN_WIDTH * 0.25,
        },
        gradient: {
            flex: 1,
        },
    }), []);

    return (
        <View style={staticStyles.container} pointerEvents="none">
            {/* Deep Purple/Void Layer - Top Left */}
            <Animated.View style={[staticStyles.layer1, nebulaStyle1]}>
                <LinearGradient
                    colors={[
                        "transparent",
                        "rgba(107, 91, 149, 0.18)", // Purple
                        "rgba(107, 91, 149, 0.13)",
                        "rgba(74, 64, 102, 0.07)",
                        "transparent"
                    ]}
                    start={{ x: 0.3, y: 0.3 }}
                    end={{ x: 0.7, y: 0.7 }}
                    style={staticStyles.gradient}
                />
            </Animated.View>

            {/* Cosmic Mist Layer - Bottom Right */}
            <Animated.View style={[staticStyles.layer2, nebulaStyle2]}>
                <LinearGradient
                    colors={[
                        "transparent",
                        "rgba(74, 124, 155, 0.13)", // Blue
                        "rgba(74, 124, 155, 0.10)",
                        "rgba(58, 95, 120, 0.05)",
                        "transparent"
                    ]}
                    start={{ x: 0.7, y: 0.7 }}
                    end={{ x: 0.3, y: 0.3 }}
                    style={staticStyles.gradient}
                />
            </Animated.View>
        </View>
    );
}
