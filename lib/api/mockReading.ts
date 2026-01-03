/**
 * Mock Reading API for Development Testing
 * 
 * This module provides mock responses that simulate the real API
 * without making actual network calls or consuming API tokens.
 * 
 * Only used when EXPO_PUBLIC_DEV_MOCK_API=true
 */

import type { Card } from "@/lib/types/tarot";

// Simulated delay to mimic API response time
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock card analysis texts
const MOCK_ANALYSES = [
    "This card speaks to the core of your question. Its presence here suggests a period of transformation, where old patterns must give way to new understanding. The imagery invites you to consider what you're holding onto that no longer serves your highest path.",
    "In this position, the card illuminates hidden currents beneath the surface of your situation. There is wisdom here about timing—not forcing what must unfold naturally, but also not remaining passive when action is called for.",
    "The energy of this card points toward relationships and how they shape your journey. Consider the mirrors that others hold up for you, and what reflections you might be avoiding or embracing.",
    "Here we see themes of inner authority and personal power. This card asks you to examine where you've been giving away your sovereignty, and where you might reclaim it with grace and intention.",
    "This position reveals the spiritual dimensions of your inquiry. Beyond the practical concerns lies a deeper invitation to align with something greater than circumstance—your own evolving consciousness.",
];

const MOCK_OPENINGS = [
    "The cards have arranged themselves with particular intention today. Let us explore what they reveal.",
    "Your question has drawn forth a meaningful spread. The patterns here speak to both challenge and possibility.",
    "The deck responds to your inquiry with clarity. These cards weave together a story worth contemplating.",
];

const MOCK_SYNTHESIS = `
Looking at these cards together, a coherent narrative emerges. The reading suggests you are at a crossroads where past patterns meet future possibilities. The cards do not prescribe a single path, but rather illuminate the terrain so you may navigate with greater awareness.

What stands out is the interplay between action and receptivity. There is a time to move boldly forward, and a time to pause and integrate. The cards suggest you may be learning to discern the difference—a skill that will serve you well beyond this immediate situation.

Consider what fears or hopes might be coloring your perception of the choices before you. The cards reflect back not just external circumstances, but the inner landscape you bring to them.
`;

const MOCK_ORACLE = `
The cards speak of thresholds—those liminal spaces where one chapter closes and another waits to begin. You stand in such a place now, though you may not fully recognize it yet.

What feels like uncertainty is actually invitation. The unknown ahead is not empty but pregnant with possibility. Your task is not to eliminate the uncertainty but to develop the capacity to move within it with grace.

Trust the intelligence of your own unfolding. The answers you seek are already within you, waiting for the right questions to call them forth. This reading is less about prediction and more about permission—permission to trust yourself, to take the next step even without guarantees.

The path will reveal itself as you walk it.
`;

export async function mockGenerateCardAnalyses(params: {
    intention: string;
    spreadType: "single" | "three" | "five";
    cards: Card[];
}) {
    console.log("🧪 [DEV MODE] Using mock card analyses");
    await delay(200); // Short delay for dev testing

    const cards = params.cards.map((card, index) => ({
        card: card.name,
        position: getPositionLabel(params.spreadType, index),
        analysis: MOCK_ANALYSES[index % MOCK_ANALYSES.length],
        image: card.image, // Pass through the card image
    }));

    return {
        opening: MOCK_OPENINGS[Math.floor(Math.random() * MOCK_OPENINGS.length)],
        cards,
    };
}

export async function mockGenerateSynthesis(intention: string, cardAnalyses: any[]) {
    console.log("🧪 [DEV MODE] Using mock synthesis");
    await delay(150);
    return { synthesis: MOCK_SYNTHESIS.trim() };
}

export async function mockGenerateOracle(intention: string, cards: Card[], synthesis: string | null) {
    console.log("🧪 [DEV MODE] Using mock oracle");
    await delay(100);
    return { oracle: MOCK_ORACLE.trim() };
}

function getPositionLabel(spreadType: "single" | "three" | "five", index: number): string {
    if (spreadType === "single") return "The Card";
    if (spreadType === "three") {
        return ["Past", "Present", "Future"][index] || `Card ${index + 1}`;
    }
    return ["Situation", "Challenge", "Past", "Future", "Potential"][index] || `Card ${index + 1}`;
}
