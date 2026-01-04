import { Linking, Platform, Alert } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Application from "expo-application";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Keys for AsyncStorage
const NOTIFICATION_ENABLED_KEY = "notifications_enabled";

// URLs - replace with your actual URLs
const TERMS_URL = "https://codextarot.app/terms";
const PRIVACY_URL = "https://codextarot.app/privacy";
const SUPPORT_EMAIL = "support@codextarot.app";

/**
 * Get the app version string
 */
export function getAppVersion(): string {
    const version = Application.nativeApplicationVersion ?? "1.0.0";
    const build = Application.nativeBuildVersion ?? "1";
    return `v${version} (${build})`;
}

/**
 * Open the Terms of Service page
 */
export async function openTerms(): Promise<void> {
    await WebBrowser.openBrowserAsync(TERMS_URL);
}

/**
 * Open the Privacy Policy page
 */
export async function openPrivacy(): Promise<void> {
    await WebBrowser.openBrowserAsync(PRIVACY_URL);
}

/**
 * Open the email client for support
 */
export async function openSupport(): Promise<void> {
    const subject = encodeURIComponent("Codex Tarot Support");
    const body = encodeURIComponent(`\n\n---\nApp Version: ${getAppVersion()}\nPlatform: ${Platform.OS}`);
    const mailtoUrl = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;

    const canOpen = await Linking.canOpenURL(mailtoUrl);
    if (canOpen) {
        await Linking.openURL(mailtoUrl);
    } else {
        Alert.alert("Error", "Could not open email client. Please email us at " + SUPPORT_EMAIL);
    }
}

/**
 * Check if notifications are enabled (user preference)
 */
export async function getNotificationsEnabled(): Promise<boolean> {
    try {
        const value = await AsyncStorage.getItem(NOTIFICATION_ENABLED_KEY);
        return value === "true";
    } catch {
        return false;
    }
}

/**
 * Set notifications enabled preference and request permissions if enabling
 * Uses dynamic import to avoid crash on Expo Go (SDK 53+ removed push notification support)
 */
export async function setNotificationsEnabled(enabled: boolean): Promise<boolean> {
    try {
        if (enabled) {
            // Dynamic import to prevent crash on Expo Go
            const Notifications = await import("expo-notifications");

            // Request permission
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== "granted") {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== "granted") {
                Alert.alert(
                    "Notifications Disabled",
                    "Please enable notifications in your device Settings to receive updates.",
                    [
                        { text: "Cancel", style: "cancel" },
                        { text: "Open Settings", onPress: () => Linking.openSettings() }
                    ]
                );
                return false;
            }
        }

        await AsyncStorage.setItem(NOTIFICATION_ENABLED_KEY, enabled ? "true" : "false");
        return true;
    } catch (error) {
        console.error("[Settings] Failed to update notification preference:", error);
        // If notifications fail (e.g., Expo Go), still save the preference
        // The actual push registration will happen in a dev build
        await AsyncStorage.setItem(NOTIFICATION_ENABLED_KEY, enabled ? "true" : "false");
        return true;
    }
}

/**
 * Open the App Store / Play Store subscription management page
 */
export async function openManageSubscription(): Promise<void> {
    const url = Platform.select({
        ios: "https://apps.apple.com/account/subscriptions",
        android: "https://play.google.com/store/account/subscriptions",
    });

    if (url) {
        await Linking.openURL(url);
    }
}
