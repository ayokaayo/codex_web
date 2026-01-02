import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GLOBAL_SYSTEM_PROMPT = `You are The Reader of the Codex Tarot — an interpreter of the Tarot de Marseille in the tradition of Jodorowsky and the symbolic school.

VOICE:
- British English
- Warm but direct — no false comfort, no doom
- Balance light and shadow in every card
- Grounded mysticism: poetic but never vague

CONSTRAINTS:
- Draw ONLY from the provided card data
- Never invent symbolism not present in the source
- Never use clichés ("trust the universe", "everything happens for a reason")
- Never give yes/no answers — illuminate, don't prescribe

KNOWLEDGE:
- Cards influence each other by position and proximity
- Numbers carry developmental meaning (1=potential, 9=crisis, 10=completion)
- Suits carry elemental energy (Swords=air, Cups=water, Wands=fire, Pentacles=earth)
- Major Arcana = universal forces; Minor Arcana = personal experience
- Symbolic handoffs between cards should be noted when prominent`;

interface Card {
    name: string;
    keywords: string[];
    description: string;
    interpretations: string;
    reading: string;
    monologue: string;
    degree?: { meaning: string; shadow: string };
    suit?: string;
}

interface CardWithPosition {
    position: string;
    card: Card;
}

// Direct API call to Anthropic using fetch
async function callAnthropic(systemPrompt: string, userMessage: string, maxTokens: number): Promise<string> {
    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
        throw new Error("ANTHROPIC_API_KEY is not set");
    }

    console.log("Calling Anthropic API...");

    const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: maxTokens,
            system: systemPrompt,
            messages: [{ role: "user", content: userMessage }],
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Anthropic API error:", response.status, errorText);
        throw new Error(`Anthropic API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("Anthropic API success");

    if (data.content && data.content.length > 0 && data.content[0].type === "text") {
        return data.content[0].text;
    }

    throw new Error("Unexpected response format from Anthropic");
}

serve(async (req) => {
    console.log("Edge Function: Request received");

    try {
        const body = await req.json();
        console.log("Edge Function: Action:", body.action);

        const { action, intention, spreadType, cards, cardAnalyses, synthesis } = body;

        let result;

        switch (action) {
            case "analyze":
                result = await analyzeCards(intention, spreadType, cards);
                break;
            case "synthesize":
                result = await synthesizeReading(intention, cardAnalyses);
                break;
            case "oracle":
                result = await generateOracle(intention, cards, synthesis);
                break;
            default:
                throw new Error("Invalid action: " + action);
        }

        console.log("Edge Function: Success");
        return new Response(JSON.stringify(result), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Edge Function Error:", error);
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
});

async function analyzeCards(
    intention: string,
    spreadType: string,
    cards: CardWithPosition[]
): Promise<{ opening: string; cards: any[] }> {
    const wordCount = spreadType === "single" ? 150 : spreadType === "three" ? 80 : 60;

    const cardsPrompt = cards
        .map(
            ({ position, card }) => `
---
POSITION: ${position}
CARD: ${card.name}
Keywords: ${card.keywords.join(", ")}
Description: ${card.description}
Reading: ${card.reading}
${card.degree ? `Degree meaning: ${card.degree.meaning}\nDegree shadow: ${card.degree.shadow}` : ""}
${card.suit ? `Suit: ${card.suit}` : ""}
---`
        )
        .join("\n");

    const systemPrompt = `${GLOBAL_SYSTEM_PROMPT}

TASK: Interpret each card in its position. Focus on what the card means here — do not yet weave cards together.

Write ~${wordCount} words per card. Include essence + one shadow note.
Be aware of suit/element patterns — let this inform your interpretation silently.`;

    const userMessage = `QUERENT'S QUESTION: "${intention}"

SPREAD: ${spreadType}

${cardsPrompt}

Return JSON only, no markdown:
{
  "opening": "1-2 sentence warm paraphrase of the question",
  "cards": [
    {"position": "...", "card": "...", "analysis": "..."}
  ]
}`;

    const text = await callAnthropic(systemPrompt, userMessage, 2000);
    return JSON.parse(text);
}

async function synthesizeReading(
    intention: string,
    cardAnalyses: any[]
): Promise<{ synthesis: string }> {
    const analysesText = cardAnalyses
        .map((c) => `${c.position} — ${c.card}:\n"${c.analysis}"`)
        .join("\n\n");

    const systemPrompt = `${GLOBAL_SYSTEM_PROMPT}

TASK: Reveal how the cards speak to each other. This is where interpretation happens.

INCLUDE:
- The arc or movement across positions
- Numerological patterns if present
- How each card's energy affects its neighbors
- What this means for the querent's specific question
- Card-to-card transitions where there's clear symbolic handoff

OPTIONALLY END WITH:
- A reflection prompt if the reading reveals tension (~30% of readings)

LENGTH: ~300 words for 3-card, ~400 words for 5-card.`;

    const userMessage = `QUERENT'S QUESTION: "${intention}"

CARD ANALYSES:

${analysesText}

Return JSON only, no markdown:
{
  "synthesis": "..."
}`;

    const text = await callAnthropic(systemPrompt, userMessage, 1500);
    return JSON.parse(text);
}

async function generateOracle(
    intention: string,
    cards: Card[],
    synthesis: string | null
): Promise<{ oracle: string }> {
    const monologues = cards
        .map((card) => `${card.name} speaks:\n"${card.monologue}"`)
        .join("\n\n");

    const wordCount = cards.length === 1 ? 120 : cards.length === 3 ? 180 : 200;

    const systemPrompt = `${GLOBAL_SYSTEM_PROMPT}

TASK: Channel the voice of the Tarot itself. The cards have merged into one consciousness addressing the querent directly.

VOICE:
- Poetic, rhythmic, incantatory
- Use imagery from the specific cards drawn
- Address the querent as "you"
- Do not repeat the synthesis — go deeper or offer a new angle
- End with something that lingers

LENGTH: ~${wordCount} words.`;

    const userMessage = `QUERENT'S QUESTION: "${intention}"

THE CARDS' VOICES:

${monologues}

${synthesis ? `THE READING CONCLUDED WITH:\n"${synthesis}"` : ""}

Return JSON only, no markdown:
{
  "oracle": "..."
}`;

    const text = await callAnthropic(systemPrompt, userMessage, 800);
    return JSON.parse(text);
}
