import { create } from "zustand";
import { Platform } from "react-native";
import Purchases, {
    CustomerInfo,
    PurchasesOffering,
    PurchasesPackage,
} from "react-native-purchases";

interface SubscriptionState {
    isInitialized: boolean;
    isProUser: boolean;
    customerInfo: CustomerInfo | null;
    offerings: PurchasesOffering | null;
    isLoading: boolean;
    error: string | null;

    initialize: () => Promise<void>;
    checkSubscription: () => Promise<boolean>;
    purchasePackage: (pkg: PurchasesPackage) => Promise<boolean>;
    restorePurchases: () => Promise<boolean>;
}

const REVENUECAT_IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY!;
const REVENUECAT_ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY!;

// Dev bypass for testing premium features
const DEV_BYPASS_PAYWALL = process.env.EXPO_PUBLIC_DEV_BYPASS_PAYWALL === "true";

if (DEV_BYPASS_PAYWALL) {
    console.log("⚠️ DEV MODE: Paywall bypassed - all premium features unlocked");
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
    isInitialized: DEV_BYPASS_PAYWALL, // Already "initialized" if bypass is on
    isProUser: DEV_BYPASS_PAYWALL, // Premium unlocked if bypass is on
    customerInfo: null,
    offerings: null,
    isLoading: false,
    error: null,

    initialize: async () => {
        // Skip initialization if dev bypass is enabled
        if (DEV_BYPASS_PAYWALL) {
            set({ isInitialized: true, isProUser: true });
            return;
        }

        if (get().isInitialized) return;

        try {
            const apiKey = Platform.OS === "ios" ? REVENUECAT_IOS_KEY : REVENUECAT_ANDROID_KEY;

            if (!apiKey) {
                console.warn("RevenueCat API key not configured");
                set({ isInitialized: true });
                return;
            }

            await Purchases.configure({ apiKey });

            const customerInfo = await Purchases.getCustomerInfo();
            const offerings = await Purchases.getOfferings();

            const isProUser = customerInfo.entitlements.active["pro"] !== undefined;

            set({
                isInitialized: true,
                customerInfo,
                offerings: offerings.current,
                isProUser,
            });
        } catch (error) {
            console.error("RevenueCat init error:", error);
            set({ isInitialized: true, error: "Failed to initialize purchases" });
        }
    },

    checkSubscription: async () => {
        try {
            const customerInfo = await Purchases.getCustomerInfo();
            const isProUser = customerInfo.entitlements.active["pro"] !== undefined;
            set({ customerInfo, isProUser });
            return isProUser;
        } catch (error) {
            console.error("Check subscription error:", error);
            return false;
        }
    },

    purchasePackage: async (pkg) => {
        set({ isLoading: true, error: null });
        try {
            const { customerInfo } = await Purchases.purchasePackage(pkg);
            const isProUser = customerInfo.entitlements.active["pro"] !== undefined;
            set({ customerInfo, isProUser, isLoading: false });
            return isProUser;
        } catch (error: any) {
            if (!error.userCancelled) {
                set({ error: "Purchase failed. Please try again.", isLoading: false });
            } else {
                set({ isLoading: false });
            }
            return false;
        }
    },

    restorePurchases: async () => {
        set({ isLoading: true, error: null });
        try {
            const customerInfo = await Purchases.restorePurchases();
            const isProUser = customerInfo.entitlements.active["pro"] !== undefined;
            set({ customerInfo, isProUser, isLoading: false });
            return isProUser;
        } catch (error) {
            set({ error: "Restore failed. Please try again.", isLoading: false });
            return false;
        }
    },
}));
