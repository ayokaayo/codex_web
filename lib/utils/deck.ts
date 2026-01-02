import { Card } from "../types/tarot";
import { cardData } from "@/data/cards";

/**
 * Fisher-Yates shuffle algorithm to randomize the deck.
 */
export const shuffleDeck = (deck: Card[]): Card[] => {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

/**
 * Draws a specified number of unique cards from the deck.
 * @param count Number of cards to draw
 * @param allowReversed (Optional) whether to allow reversed cards - failing default to false for now as text doesn't support it yet
 */
export const drawCards = (count: number, allowReversed: boolean = false): Card[] => {
    // 1. Get all cards from data source
    const fullDeck = [...cardData.cards];

    // 2. Shuffle
    const shuffled = shuffleDeck(fullDeck);

    // 3. Slice the needed amount
    const drawn = shuffled.slice(0, count);

    // 4. (Future) Handle reversals if we implement them
    // For now, we just return the cards
    return drawn;
};
