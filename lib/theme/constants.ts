/**
 * Theme constants for use in StyleSheet.create() and non-NativeWind contexts.
 * These values mirror tailwind.config.js to ensure consistency.
 */

// Colors - mirrors tailwind.config.js
export const COLORS = {
    // Backgrounds
    void: "#0A0A0F",
    nebula: "#12121A",
    surface: "#1A1A24",
    surfaceLight: "#2A2A3A",

    // Brand
    goldBright: "#FFB800",
    goldVivid: "#E89500",
    gold: "#C9A962",
    goldMuted: "#8B7355",
    goldDim: "#6B5B45",
    goldRipple: "rgba(201, 169, 98, 0.2)",
    goldSemiTransparent: "rgba(201, 169, 98, 0.3)",

    // Text
    textPrimary: "#E8E6E3",
    textRead: "#D4D4D4",
    textSecondary: "#8A8A8A",
    textMuted: "#5A5A5A",

    // States
    error: "#D56B6B",
    success: "#4A9B6B",
} as const;

// Sizing
export const SIZES = {
    // Navigation elements
    arrowButton: 44,
    positionCircle: 40,
    iconSmall: 24,
    iconMedium: 28,

    // Spacing
    spacing: {
        xs: 4,
        sm: 8,
        md: 12,
        lg: 16,
        xl: 24,
    },

    // Hit slop for touch targets
    hitSlop: {
        small: { top: 8, bottom: 8, left: 8, right: 8 },
        medium: { top: 10, bottom: 10, left: 10, right: 10 },
    },
} as const;

// Font families
export const FONTS = {
    cinzel: "Cinzel-Regular",
    cinzelSemiBold: "Cinzel-SemiBold",
    cinzelBold: "Cinzel-Bold",
    cinzelExtraBold: "Cinzel-ExtraBold",
    garamond: "EBGaramond-Regular",
    garamondMedium: "EBGaramond-Medium",
    garamondItalic: "EBGaramond-Italic",
    garamondBold: "EBGaramond-Bold",
} as const;
