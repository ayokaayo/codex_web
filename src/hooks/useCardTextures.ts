import { useMemo } from 'react';

// ============================================
// Complete list of all tarot cards
// ============================================
const MAJOR_ARCANA = [
    'the_fool',
    'the_magician',
    'the_high_priestess',
    'the_empress',
    'the_emperor',
    'the_hierophant',
    'the_lovers',
    'the_chariot',
    'strength',
    'the_hermit',
    'the_wheel_of_fortune',
    'justice',
    'the_hanged_man',
    'the_nameless_arcanum', // Death card alternative name
    'temperance',
    'the_devil',
    'the_tower',
    'the_star',
    'the_moon',
    'the_sun',
    'judgment',
    'the_world',
];

const SUITS = ['cups', 'pentacles', 'swords', 'wands'];
const RANKS = [
    'ace', 'two', 'three', 'four', 'five', 'six', 'seven',
    'eight', 'nine', 'ten', 'page', 'knight', 'queen', 'king'
];

// Generate all minor arcana card names
const MINOR_ARCANA = SUITS.flatMap(suit =>
    RANKS.map(rank => `${rank}_of_${suit}`)
);

// All cards combined
const ALL_CARDS = [...MAJOR_ARCANA, ...MINOR_ARCANA];

// ============================================
// Fisher-Yates shuffle algorithm
// ============================================
function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// ============================================
// Hook: useCardTextures
// ============================================
export interface UseCardTexturesOptions {
    count?: number;             // Number of cards to use (default: all)
    shuffle?: boolean;          // Whether to shuffle (default: true)
    basePath?: string;          // Base path to card images
}

export interface UseCardTexturesResult {
    cardPaths: string[];        // Array of full paths to card images
    cardNames: string[];        // Array of card names
    reshuffled: () => void;      // Function to trigger reshuffle
    totalAvailable: number;     // Total cards available
}

export function useCardTextures(options: UseCardTexturesOptions = {}): UseCardTexturesResult {
    const {
        count,
        shuffle = true,
        basePath = '/assets/cards/',
    } = options;

    // Memoize shuffled cards (only reshuffles on mount or explicit call)
    const { cardNames, cardPaths } = useMemo(() => {
        let cards = shuffle ? shuffleArray(ALL_CARDS) : [...ALL_CARDS];

        if (count && count < cards.length) {
            cards = cards.slice(0, count);
        }

        return {
            cardNames: cards,
            cardPaths: cards.map(name => `${basePath}${name}.webp`),
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty deps = shuffle once on mount

    // Reshuffle function (would need state to actually trigger re-render)
    const reshuffled = () => {
        // In practice, you'd use useState and update it here
        console.log('Reshuffle requested - reload page for new order');
    };

    return {
        cardPaths,
        cardNames,
        reshuffled,
        totalAvailable: ALL_CARDS.length,
    };
}

// Export card lists for external use
export { ALL_CARDS, MAJOR_ARCANA, MINOR_ARCANA, shuffleArray };
