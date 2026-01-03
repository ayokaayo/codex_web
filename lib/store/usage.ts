import { create } from "zustand";
import { getUsage, incrementUsage as apiIncrementUsage, UsageData } from "@/lib/api/usage";

interface UsageState {
    // Data
    usage: UsageData | null;
    isLoading: boolean;
    error: string | null;
    lastFetched: Date | null;

    // Actions
    fetchUsage: () => Promise<void>;
    incrementUsage: (spreadType: "single" | "three" | "five") => Promise<void>;
    canUseSpread: (spreadType: "single" | "three" | "five") => boolean;
    getRemainingReadings: (spreadType: "three" | "five") => number;
}

export const useUsageStore = create<UsageState>((set, get) => ({
    usage: null,
    isLoading: false,
    error: null,
    lastFetched: null,

    fetchUsage: async () => {
        // Don't refetch if we fetched recently (within 30 seconds)
        const lastFetched = get().lastFetched;
        if (lastFetched && Date.now() - lastFetched.getTime() < 30000) {
            return;
        }

        set({ isLoading: true, error: null });

        try {
            const usage = await getUsage();
            set({ usage, isLoading: false, lastFetched: new Date() });
        } catch (error) {
            console.error("[UsageStore] Failed to fetch usage:", error);
            set({
                error: error instanceof Error ? error.message : "Failed to fetch usage",
                isLoading: false,
            });
        }
    },

    incrementUsage: async (spreadType) => {
        try {
            await apiIncrementUsage(spreadType);

            // Optimistically update local state
            const currentUsage = get().usage;
            if (currentUsage) {
                const key = spreadType === "single" ? "one_card" : spreadType === "three" ? "three_card" : "five_card";
                set({
                    usage: {
                        ...currentUsage,
                        usage: {
                            ...currentUsage.usage,
                            [key]: currentUsage.usage[key] + 1,
                        },
                        can_use: {
                            ...currentUsage.can_use,
                            // Update can_use based on new count vs limits
                            [key]: spreadType === "single"
                                ? true
                                : currentUsage.usage[key] + 1 < (currentUsage.limits[key] ?? Infinity),
                        },
                    },
                });
            }
        } catch (error) {
            console.error("[UsageStore] Failed to increment usage:", error);
            // Don't block the user - just log the error
        }
    },

    canUseSpread: (spreadType) => {
        const usage = get().usage;
        if (!usage) return true; // Allow if we haven't loaded usage yet

        if (spreadType === "single") return true; // Always allow 1-card

        const key = spreadType === "three" ? "three_card" : "five_card";
        return usage.can_use[key];
    },

    getRemainingReadings: (spreadType) => {
        const usage = get().usage;
        if (!usage) return 0;

        const key = spreadType === "three" ? "three_card" : "five_card";
        const used = usage.usage[key];
        const limit = usage.limits[key];

        return Math.max(0, limit - used);
    },
}));
