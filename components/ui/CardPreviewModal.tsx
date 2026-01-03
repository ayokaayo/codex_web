import { View, Modal, Pressable, Image, Dimensions } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { Text } from "./Text";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Card aspect ratio based on provided dimensions: 540x1018
const CARD_ASPECT_RATIO = 540 / 1018;

interface Props {
    visible: boolean;
    card: { name: string; image: any } | null;
    onClose: () => void;
}

export function CardPreviewModal({ visible, card, onClose }: Props) {
    if (!card) return null;

    const cardWidth = SCREEN_WIDTH * 0.85;
    const cardHeight = cardWidth / CARD_ASPECT_RATIO;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable
                className="flex-1 items-center justify-center"
                style={{ backgroundColor: "rgba(0, 0, 0, 0.9)" }}
                onPress={onClose}
            >
                <Animated.View
                    entering={FadeIn.duration(300)}
                    exiting={FadeOut.duration(200)}
                    className="items-center"
                >
                    {/* Card Image */}
                    <Image
                        source={card.image}
                        style={{
                            width: cardWidth,
                            height: cardHeight,
                            borderRadius: 16,
                        }}
                        resizeMode="cover"
                    />

                    {/* Card Name */}
                    <Animated.View
                        entering={FadeIn.delay(200).duration(400)}
                        className="mt-6"
                    >
                        <Text
                            variant="heading"
                            className="text-center text-gold-bright"
                            style={{ fontFamily: "Cinzel-Bold" }}
                        >
                            {card.name}
                        </Text>
                    </Animated.View>
                </Animated.View>
            </Pressable>
        </Modal>
    );
}
