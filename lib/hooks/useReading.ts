import { useCallback } from "react";
import { useReadingStore } from "@/lib/store/reading";
import {
    generateCardAnalyses,
    generateSynthesis,
    generateOracle,
} from "@/lib/api/reading";
import type { Card } from "@/lib/types/tarot";

export function useReading() {
    const store = useReadingStore();

    const generateReading = useCallback(
        async (intention: string, spreadType: "single" | "three" | "five", cards: Card[]) => {
            store.setIntention(intention);
            store.setSpreadType(spreadType);
            store.setSelectedCards(cards);
            store.setError(null);

            try {
                // Call 1: Card analyses
                console.log("[useReading] Starting reading generation...");
                console.log("[useReading] Intention:", intention);
                console.log("[useReading] SpreadType:", spreadType);
                console.log("[useReading] Cards:", cards.map(c => c.name));

                store.setStatus("analyzing");
                console.log("[useReading] Calling generateCardAnalyses...");
                const call1 = await generateCardAnalyses({
                    intention,
                    spreadType,
                    cards,
                });
                console.log("[useReading] Call 1 response:", call1);
                store.setOpening(call1.opening);
                store.setCardAnalyses(call1.cards);

                // Single card: skip synthesis
                if (spreadType === "single") {
                    store.setStatus("oracle");
                    const call3 = await generateOracle(intention, cards, null);
                    store.setOracle(call3.oracle);
                    store.setStatus("complete");
                    return;
                }

                // Call 2: Synthesis
                store.setStatus("synthesizing");
                console.log("[useReading] Calling generateSynthesis...");
                const call2 = await generateSynthesis(intention, call1.cards);
                console.log("[useReading] Call 2 response:", call2);
                store.setSynthesis(call2.synthesis);

                // Call 3: Oracle
                store.setStatus("oracle");
                console.log("[useReading] Calling generateOracle...");
                const call3 = await generateOracle(intention, cards, call2.synthesis);
                console.log("[useReading] Call 3 response:", call3);
                store.setOracle(call3.oracle);

                console.log("[useReading] Reading complete!");
                store.setStatus("complete");
            } catch (error) {
                const retryCount = store.retryCount;
                console.error("[useReading] Error:", error);

                if (retryCount < 2) {
                    // Retry up to 2 times
                    console.log(`[useReading] Retrying... attempt ${retryCount + 1}`);
                    store.incrementRetry();
                    // Add delay before retry
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    return generateReading(intention, spreadType, cards);
                }

                // Max retries reached - show error
                console.error("[useReading] Max retries reached, showing error to user");
                store.setError(
                    error instanceof Error ? error.message : "Reading failed. The server may be temporarily unavailable."
                );
                store.setStatus("error");
            }
        },
        [store]
    );

    return {
        ...store,
        generateReading,
    };
}
