import React, { useState, useRef, useCallback } from "react";
import {
    View,
    Modal,
    Pressable,
    ScrollView,
    Dimensions,
    StyleSheet,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
    FadeIn,
    SlideInRight,
    SlideOutLeft,
} from "react-native-reanimated";
import { X, ChevronLeft, ChevronRight } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { TarotCard } from "@/components/tarot/TarotCard";
import { cardData } from "@/data/cards";
import type { Card } from "@/lib/types/tarot";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Position names for each spread type
const POSITION_NAMES = {
    single: ["MAIN ACTOR"],
    three: ["PAST / GENESIS", "PRESENT / ACTUALITY", "FUTURE / REACTION"],
    five: [
        "OBSTACLE OR BLOCKAGE",
        "MEANS OF RESOLUTION",
        "ACTION TO UNDERTAKE",
        "TRANSFORMATIVE PATHWAY",
        "PURPOSE OR DESTINATION",
    ],
};

type CardType = "major" | "minor" | "court" | "random";
type Suit = "wands" | "cups" | "swords" | "pentacles";

interface SelectionStep {
    type: "choose-type" | "choose-suit" | "choose-card" | "choose-rank" | "selected";
    cardType?: CardType;
    suit?: Suit;
}

interface Props {
    visible: boolean;
    spreadType: "single" | "three" | "five";
    onClose: () => void;
    onComplete: (selectedCards: Card[]) => void;
}

export function CardSelectionFlow({
    visible,
    spreadType,
    onClose,
    onComplete,
}: Props) {
    const insets = useSafeAreaInsets();
    const positions = POSITION_NAMES[spreadType];
    const totalPositions = positions.length;

    // Current position being filled (0-indexed)
    const [currentPosition, setCurrentPosition] = useState(0);

    // Selection step for current position
    const [selectionStep, setSelectionStep] = useState<SelectionStep>({
        type: "choose-type",
    });

    // Selected cards for each position
    const [selectedCards, setSelectedCards] = useState<(Card | null)[]>(
        Array(totalPositions).fill(null)
    );

    // Track which cards have been selected (for duplicate prevention)
    const selectedCardIds = new Set(
        selectedCards.filter(Boolean).map((c) => c!.id)
    );

    // Go to a specific position
    const goToPosition = (index: number) => {
        Haptics.selectionAsync();
        setCurrentPosition(index);
        if (selectedCards[index]) {
            setSelectionStep({ type: "selected" });
        } else {
            setSelectionStep({ type: "choose-type" });
        }
    };

    // Get available cards (excluding already selected)
    const getAvailableCards = useCallback(
        (filter?: { arcanaType?: string; suit?: string }) => {
            return cardData.cards.filter((card) => {
                // Exclude already selected cards
                if (selectedCardIds.has(card.id)) return false;

                // Apply filters
                if (filter?.arcanaType && card.arcanaType !== filter.arcanaType)
                    return false;
                if (filter?.suit && card.suit !== filter.suit) return false;

                return true;
            });
        },
        [selectedCardIds]
    );

    // Reset state when modal closes
    const handleClose = () => {
        setCurrentPosition(0);
        setSelectionStep({ type: "choose-type" });
        setSelectedCards(Array(totalPositions).fill(null));
        onClose();
    };

    // Handle card type selection
    const handleTypeSelect = (type: CardType) => {
        Haptics.selectionAsync();

        if (type === "random") {
            // Pick a random card from available pool
            const available = getAvailableCards();
            const randomCard = available[Math.floor(Math.random() * available.length)];
            handleCardSelected(randomCard);
        } else if (type === "major") {
            setSelectionStep({ type: "choose-card", cardType: "major" });
        } else if (type === "minor") {
            setSelectionStep({ type: "choose-suit", cardType: "minor" });
        } else if (type === "court") {
            setSelectionStep({ type: "choose-suit", cardType: "court" });
        }
    };

    // Handle suit selection
    const handleSuitSelect = (suit: Suit) => {
        Haptics.selectionAsync();
        if (selectionStep.cardType === "minor") {
            setSelectionStep({ type: "choose-card", cardType: "minor", suit });
        } else if (selectionStep.cardType === "court") {
            setSelectionStep({ type: "choose-card", cardType: "court", suit });
        }
    };

    // Handle final card selection
    const handleCardSelected = (card: Card) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        const newSelectedCards = [...selectedCards];
        newSelectedCards[currentPosition] = card;
        setSelectedCards(newSelectedCards);
        setSelectionStep({ type: "selected" });
    };

    // Go to next position
    const handleNextPosition = () => {
        if (currentPosition < totalPositions - 1) {
            goToPosition(currentPosition + 1);
        }
    };

    // Handle back within drill-down
    const handleBack = () => {
        Haptics.selectionAsync();
        if (selectionStep.type === "choose-card" && selectionStep.suit) {
            // Go back to suit selection
            setSelectionStep({ type: "choose-suit", cardType: selectionStep.cardType });
        } else if (selectionStep.type === "choose-card" || selectionStep.type === "choose-suit") {
            // Go back to type selection
            setSelectionStep({ type: "choose-type" });
        } else if (selectionStep.type === "selected") {
            // Go back to type selection to change card
            setSelectionStep({ type: "choose-type" });
        }
    };

    // Change card (from selected state)
    const handleChangeCard = () => {
        Haptics.selectionAsync();
        // Remove the current selection
        const newSelectedCards = [...selectedCards];
        newSelectedCards[currentPosition] = null;
        setSelectedCards(newSelectedCards);
        setSelectionStep({ type: "choose-type" });
    };

    // Complete the selection
    const handleComplete = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        const cards = selectedCards.filter(Boolean) as Card[];
        onComplete(cards);
        handleClose();
    };

    // Check if all positions are filled
    const allPositionsFilled = selectedCards.every((c) => c !== null);

    // Render position header (card number + position name)
    const renderPositionHeader = () => (
        <View className="items-center mb-4">
            <Text
                style={{ fontFamily: "Cinzel-Bold" }}
                className="text-gold-bright text-2xl tracking-wider"
            >
                Card {currentPosition + 1}
            </Text>
            <Text
                style={{ fontFamily: "Cinzel-Bold" }}
                className="text-gold/70 text-base tracking-wider mt-1"
            >
                {positions[currentPosition]}
            </Text>
        </View>
    );

    // Render card type selection
    const renderTypeSelection = () => (
        <Animated.View
            entering={FadeIn.duration(300)}
            className="flex-1 px-4"
        >
            {renderPositionHeader()}
            <Text
                style={{ fontFamily: "Cinzel-Bold" }}
                className="text-center text-text-muted text-xl mb-6"
            >
                Select the Card Type
            </Text>
            <View className="gap-3">
                {(["major", "minor", "court", "random"] as CardType[]).map((type) => (
                    <Pressable
                        key={type}
                        onPress={() => handleTypeSelect(type)}
                        className="bg-surface border border-surface-light rounded-xl py-4 px-6"
                    >
                        <Text
                            style={{ fontFamily: "Cinzel-Bold" }}
                            className="text-center text-text-primary text-lg capitalize"
                        >
                            {type === "major"
                                ? "Major Arcana"
                                : type === "minor"
                                    ? "Minor Arcana"
                                    : type === "court"
                                        ? "Court Cards"
                                        : "Random"}
                        </Text>
                    </Pressable>
                ))}
            </View>
        </Animated.View>
    );

    // Render suit selection
    const renderSuitSelection = () => (
        <Animated.View
            entering={SlideInRight.duration(250)}
            exiting={SlideOutLeft.duration(200)}
            className="flex-1 px-4"
        >
            {renderPositionHeader()}
            <Text
                style={{ fontFamily: "Cinzel-Bold" }}
                className="text-center text-text-muted text-xl mb-6"
            >
                Select the Suit
            </Text>
            <View className="gap-3">
                {(["wands", "cups", "swords", "pentacles"] as Suit[]).map((suit) => (
                    <Pressable
                        key={suit}
                        onPress={() => handleSuitSelect(suit)}
                        className="bg-surface border border-surface-light rounded-xl py-4 px-6"
                    >
                        <Text
                            style={{ fontFamily: "Cinzel-Bold" }}
                            className="text-center text-text-primary text-lg capitalize"
                        >
                            {suit}
                        </Text>
                    </Pressable>
                ))}
            </View>
        </Animated.View>
    );

    // Render card list
    const renderCardSelection = () => {
        let cards: Card[] = [];
        let title = "Select a Card";

        if (selectionStep.cardType === "major") {
            cards = getAvailableCards({ arcanaType: "major" });
        } else if (selectionStep.cardType === "minor" && selectionStep.suit) {
            cards = getAvailableCards({ arcanaType: "minor" }).filter(
                (c) => c.suit === selectionStep.suit
            );
            title = `Select a ${selectionStep.suit} Card`;
        } else if (selectionStep.cardType === "court" && selectionStep.suit) {
            cards = getAvailableCards({ arcanaType: "court" }).filter(
                (c) => c.suit === selectionStep.suit
            );
            title = `Select a ${selectionStep.suit} Court Card`;
        }

        return (
            <Animated.View
                entering={SlideInRight.duration(250)}
                exiting={SlideOutLeft.duration(200)}
                className="flex-1"
            >
                <View className="px-4">
                    {renderPositionHeader()}
                    <Text
                        style={{ fontFamily: "Cinzel-Bold" }}
                        className="text-center text-text-muted text-xl mb-4 capitalize"
                    >
                        {title}
                    </Text>
                </View>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
                >
                    <View className="gap-3">
                        {cards.map((card) => (
                            <Pressable
                                key={card.id}
                                onPress={() => handleCardSelected(card)}
                                className="bg-surface border border-surface-light rounded-xl py-4 px-6"
                            >
                                <Text
                                    style={{ fontFamily: "Cinzel-Bold" }}
                                    className="text-center text-text-primary text-lg"
                                >
                                    {card.name}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </ScrollView>
            </Animated.View>
        );
    };

    // Render selected card preview
    const renderSelectedCard = () => {
        const card = selectedCards[currentPosition];
        if (!card) return null;

        return (
            <Animated.View
                entering={FadeIn.duration(400)}
                className="flex-1 items-center px-4"
            >
                {renderPositionHeader()}
                <TarotCard
                    name={card.name}
                    image={card.image}
                    isRevealed={true}
                    size="medium"
                    showName={false}
                />
                <Text
                    style={{ fontFamily: "Cinzel-Bold" }}
                    className="text-gold-bright text-xl mt-4 text-center"
                >
                    {card.name}
                </Text>
                <Text className="text-text-muted text-sm mt-2 text-center px-8">
                    {card.keywords.slice(0, 3).join(" • ")}
                </Text>
            </Animated.View>
        );
    };

    // Render progress navigation with arrows and numbered circles
    const renderProgressNavigation = () => (
        <View style={styles.navigationContainer} pointerEvents="box-none">
            {/* Left Arrow */}
            <Pressable
                onPress={() => {
                    if (currentPosition > 0) {
                        goToPosition(currentPosition - 1);
                    }
                }}
                disabled={currentPosition === 0}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                android_ripple={{ color: 'rgba(201, 169, 98, 0.2)' }}
                style={[
                    styles.arrowButton,
                    currentPosition > 0 ? styles.arrowButtonActive : styles.arrowButtonDisabled,
                ]}
            >
                <ChevronLeft color="#C9A962" size={28} />
            </Pressable>

            <View style={styles.spacer} />

            {/* Numbered Position Circles */}
            <View style={styles.circlesContainer}>
                {positions.map((_, index) => {
                    const isCurrent = index === currentPosition;
                    const isComplete = selectedCards[index] !== null;

                    return (
                        <View key={index} style={index > 0 ? styles.circleWrapper : undefined}>
                            <Pressable
                                onPress={() => goToPosition(index)}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                android_ripple={{ color: 'rgba(201, 169, 98, 0.2)' }}
                                style={[
                                    styles.positionCircle,
                                    isCurrent && styles.positionCircleCurrent,
                                    isComplete && !isCurrent && styles.positionCircleComplete,
                                    !isComplete && !isCurrent && styles.positionCircleEmpty,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.positionText,
                                        isCurrent && styles.positionTextCurrent,
                                        isComplete && !isCurrent && styles.positionTextComplete,
                                        !isComplete && !isCurrent && styles.positionTextEmpty,
                                    ]}
                                >
                                    {index + 1}
                                </Text>
                            </Pressable>
                        </View>
                    );
                })}
            </View>

            <View style={styles.spacer} />

            {/* Right Arrow */}
            <Pressable
                onPress={() => {
                    if (currentPosition < totalPositions - 1) {
                        goToPosition(currentPosition + 1);
                    }
                }}
                disabled={currentPosition >= totalPositions - 1}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                android_ripple={{ color: 'rgba(201, 169, 98, 0.2)' }}
                style={[
                    styles.arrowButton,
                    currentPosition < totalPositions - 1 ? styles.arrowButtonActive : styles.arrowButtonDisabled,
                ]}
            >
                <ChevronRight color="#C9A962" size={28} />
            </Pressable>
        </View>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="fullScreen"
            onRequestClose={handleClose}
        >
            <View style={{
                flex: 1,
                backgroundColor: '#0A0A0F',
                paddingTop: insets.top,
            }}>
                {/* Header - just close button */}
                <View className="flex-row items-center justify-between px-4 py-2">
                    <Pressable onPress={handleClose} className="p-2">
                        <X color="#C9A962" size={24} />
                    </Pressable>
                    <View style={{ width: 40 }} />
                </View>

                {/* Content */}
                <View style={{ flex: 1 }} pointerEvents="box-none">
                    {selectionStep.type === "choose-type" && renderTypeSelection()}
                    {selectionStep.type === "choose-suit" && renderSuitSelection()}
                    {selectionStep.type === "choose-card" && renderCardSelection()}
                    {selectionStep.type === "selected" && renderSelectedCard()}
                </View>

                {/* Progress Navigation - always visible */}
                {renderProgressNavigation()}

                {/* Footer Buttons */}
                <View style={{
                    paddingHorizontal: 16,
                    paddingBottom: Math.max(insets.bottom + 8, 24),
                    gap: 12,
                }}>
                    {/* Back / Change Card Button - full width, disabled on type selection */}
                    <Pressable
                        onPress={selectionStep.type === "selected" ? handleChangeCard : handleBack}
                        disabled={selectionStep.type === "choose-type"}
                        style={{
                            backgroundColor: selectionStep.type === "choose-type"
                                ? '#1A1A24'
                                : '#2A2A3A',
                            borderRadius: 12,
                            paddingVertical: 14,
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: 8,
                            opacity: selectionStep.type === "choose-type" ? 0.4 : 1,
                        }}
                    >
                        <Text
                            style={{
                                fontFamily: 'Cinzel-Bold',
                                fontSize: 14,
                                color: selectionStep.type === "choose-type" ? '#5A5A5A' : '#C9A962',
                                letterSpacing: 1,
                            }}
                        >
                            {selectionStep.type === "selected" ? "CHANGE CARD" : "BACK"}
                        </Text>
                    </Pressable>

                    {/* Action Button - only when card is selected */}
                    {selectionStep.type === "selected" && (
                        <View>
                            {currentPosition < totalPositions - 1 ? (
                                <Button
                                    variant="primary"
                                    onPress={handleNextPosition}
                                >
                                    Next Position
                                </Button>
                            ) : allPositionsFilled ? (
                                <Button
                                    variant="primary"
                                    onPress={handleComplete}
                                >
                                    BEGIN READING
                                </Button>
                            ) : (
                                <Button
                                    variant="primary"
                                    onPress={() => {
                                        // Find first empty position
                                        const emptyIndex = selectedCards.findIndex((c) => c === null);
                                        if (emptyIndex !== -1) {
                                            goToPosition(emptyIndex);
                                        }
                                    }}
                                >
                                    Continue
                                </Button>
                            )}
                        </View>
                    )}
                </View>
            </View>
        </Modal >
    );
}

const styles = StyleSheet.create({
    navigationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    spacer: {
        width: 16,
    },
    arrowButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    arrowButtonActive: {
        backgroundColor: '#1A1A24',
        opacity: 1,
    },
    arrowButtonDisabled: {
        backgroundColor: 'transparent',
        opacity: 0.3,
    },
    circlesContainer: {
        flexDirection: 'row',
    },
    circleWrapper: {
        marginLeft: 12,
    },
    positionCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    positionCircleCurrent: {
        backgroundColor: '#C9A962',
    },
    positionCircleComplete: {
        backgroundColor: 'rgba(201, 169, 98, 0.3)',
        borderWidth: 1,
        borderColor: '#C9A962',
    },
    positionCircleEmpty: {
        backgroundColor: '#1A1A24',
    },
    positionText: {
        fontFamily: 'Cinzel-Bold',
        fontSize: 16,
    },
    positionTextCurrent: {
        color: '#0A0A0F',
    },
    positionTextComplete: {
        color: '#C9A962',
    },
    positionTextEmpty: {
        color: '#5A5A5A',
    },
});
