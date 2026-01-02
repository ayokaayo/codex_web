import { supabase } from "./supabase";
import type { Card, CardAnalysis } from "@/lib/types/tarot";
import { cardData } from "@/data/cards";

interface GenerateReadingParams {
    intention: string;
    spreadType: "single" | "three" | "five";
    cards: Card[];
}

interface Call1Response {
    opening: string;
    cards: CardAnalysis[];
}

interface Call2Response {
    synthesis: string;
}

interface Call3Response {
    oracle: string;
}

// Get position names based on spread type
function getPositionNames(spreadType: "single" | "three" | "five"): string[] {
    const spread = cardData.spreads[spreadType];
    return spread?.positions || ["Position 1"];
}

export async function generateCardAnalyses(
    params: GenerateReadingParams
): Promise<Call1Response> {
    console.log("[API] generateCardAnalyses called with:", {
        intention: params.intention,
        spreadType: params.spreadType,
        cardCount: params.cards.length,
    });

    // Transform cards to CardWithPosition format
    const positions = getPositionNames(params.spreadType);
    const cardsWithPositions = params.cards.map((card, index) => ({
        position: positions[index] || `Position ${index + 1}`,
        card: card,
    }));

    console.log("[API] Cards with positions:", cardsWithPositions.map(c => ({ position: c.position, name: c.card.name })));

    const { data, error } = await supabase.functions.invoke("reading", {
        body: {
            action: "analyze",
            intention: params.intention,
            spreadType: params.spreadType,
            cards: cardsWithPositions,
        },
    });

    console.log("[API] generateCardAnalyses response:", { data, error });
    if (error) throw new Error(error.message);
    return data;
}

export async function generateSynthesis(
    intention: string,
    cardAnalyses: CardAnalysis[]
): Promise<Call2Response> {
    const { data, error } = await supabase.functions.invoke("reading", {
        body: {
            action: "synthesize",
            intention,
            cardAnalyses,
        },
    });

    if (error) throw new Error(error.message);
    return data;
}

export async function generateOracle(
    intention: string,
    cards: Card[],
    synthesis: string | null
): Promise<Call3Response> {
    const { data, error } = await supabase.functions.invoke("reading", {
        body: {
            action: "oracle",
            intention,
            cards,
            synthesis,
        },
    });

    if (error) throw new Error(error.message);
    return data;
}
