import { supabase } from "./supabase";
import Purchases from "react-native-purchases";
import * as SecureStore from "expo-secure-store";

export interface UsageData {
    usage: {
        one_card: number;
        three_card: number;
        five_card: number;
    };
    limits: {
        one_card: number | null;
        three_card: number;
        five_card: number;
    };
    can_use: {
        one_card: boolean;
        three_card: boolean;
        five_card: boolean;
    };
}

const DEVICE_ID_KEY = "codex_device_id";

/**
 * Get or create a persistent device ID.
 * This is used as a fallback when RevenueCat isn't configured.
 */
async function getOrCreateDeviceId(): Promise<string> {
    try {
        let deviceId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
        if (!deviceId) {
            deviceId = `device-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId);
            console.log("[Usage] Created new device ID:", deviceId);
        }
        return deviceId;
    } catch (error) {
        console.error("[Usage] SecureStore error:", error);
        // Last resort fallback - this will cause issues but at least won't crash
        return `fallback-${Date.now()}`;
    }
}

/**
 * Get the user ID for usage tracking.
 * Uses RevenueCat's app user ID if available, otherwise falls back to device ID.
 */
export async function getUserId(): Promise<string> {
    try {
        const appUserId = await Purchases.getAppUserID();
        return appUserId;
    } catch (error) {
        // RevenueCat not configured - use persistent device ID
        console.log("[Usage] RevenueCat not available, using device ID");
        return getOrCreateDeviceId();
    }
}

/**
 * Get current usage for the user this month.
 */
export async function getUsage(): Promise<UsageData> {
    const userId = await getUserId();
    console.log("[Usage] Fetching usage for user:", userId);

    const { data, error } = await supabase.functions.invoke("usage", {
        body: {
            action: "get",
            user_id: userId,
        },
    });

    if (error) {
        console.error("[Usage] Failed to get usage:", error);
        throw new Error(error.message);
    }

    console.log("[Usage] Got usage data:", data);
    return data as UsageData;
}

/**
 * Increment usage count after a reading is completed.
 */
export async function incrementUsage(
    spreadType: "single" | "three" | "five"
): Promise<void> {
    const userId = await getUserId();
    console.log("[Usage] Incrementing usage for user:", userId, "spread:", spreadType);

    // Map spread type to the format expected by the edge function
    const spreadTypeMap = {
        single: "one_card",
        three: "three_card",
        five: "five_card",
    };

    const { data, error } = await supabase.functions.invoke("usage", {
        body: {
            action: "increment",
            user_id: userId,
            spread_type: spreadTypeMap[spreadType],
        },
    });

    if (error) {
        console.error("[Usage] Failed to increment usage:", error);
        // Don't throw - we don't want to block the reading if usage tracking fails
    } else {
        console.log("[Usage] Increment success:", data);
    }
}
