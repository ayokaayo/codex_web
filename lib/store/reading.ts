import { create } from "zustand";
import type { Card, CardAnalysis, Reading, ReadingStatus } from "@/lib/types/tarot";

interface ReadingState {
    // Input
    intention: string;
    spreadType: "single" | "three" | "five";
    selectedCards: Card[];

    // Progress
    status: ReadingStatus;
    retryCount: number;

    // Results (arrive progressively)
    opening: string | null;
    cardAnalyses: CardAnalysis[] | null;
    synthesis: string | null;
    oracle: string | null;

    // Error
    error: string | null;

    // Actions
    setIntention: (intention: string) => void;
    setSpreadType: (type: "single" | "three" | "five") => void;
    setSelectedCards: (cards: Card[]) => void;
    setStatus: (status: ReadingStatus) => void;
    setOpening: (opening: string) => void;
    setCardAnalyses: (analyses: CardAnalysis[]) => void;
    setSynthesis: (synthesis: string) => void;
    setOracle: (oracle: string) => void;
    setError: (error: string | null) => void;
    incrementRetry: () => void;
    reset: () => void;

    // Computed
    currentReading: () => Reading | null;
}

const initialState = {
    intention: "",
    spreadType: "single" as const,
    selectedCards: [],
    status: "idle" as ReadingStatus,
    retryCount: 0,
    opening: null,
    cardAnalyses: null,
    synthesis: null,
    oracle: null,
    error: null,
};

export const useReadingStore = create<ReadingState>((set, get) => ({
    ...initialState,

    setIntention: (intention) => set({ intention }),
    setSpreadType: (spreadType) => set({ spreadType }),
    setSelectedCards: (selectedCards) => set({ selectedCards }),
    setStatus: (status) => set({ status }),
    setOpening: (opening) => set({ opening }),
    setCardAnalyses: (cardAnalyses) => set({ cardAnalyses }),
    setSynthesis: (synthesis) => set({ synthesis }),
    setOracle: (oracle) => set({ oracle }),
    setError: (error) => set({ error }),
    incrementRetry: () => set((state) => ({ retryCount: state.retryCount + 1 })),

    reset: () => set(initialState),

    currentReading: () => {
        const state = get();
        if (state.status !== "complete") return null;

        return {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            intention: state.intention,
            spreadType: state.spreadType,
            opening: state.opening!,
            cards: state.cardAnalyses!,
            synthesis: state.synthesis,
            oracle: state.oracle!,
        };
    },
}));
