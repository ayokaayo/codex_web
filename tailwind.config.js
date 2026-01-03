/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        void: "#0A0A0F",
        nebula: "#12121A",
        surface: "#1A1A24",

        // Brand
        "gold-bright": "#FFB800",
        "gold-vivid": "#E89500",
        gold: "#C9A962",
        "gold-muted": "#8B7355",
        "gold-dim": "#6B5B45",

        // Accents
        purple: "#6B5B95",
        "purple-muted": "#4A4066",
        blue: "#4A7C9B",
        "blue-muted": "#3A5F78",

        // Text
        "text-primary": "#E8E6E3",
        "text-read": "#D4D4D4", // Softened for long reading
        "text-secondary": "#8A8A8A",
        "text-muted": "#5A5A5A",

        // States
        error: "#D56B6B",
        success: "#4A9B6B",
      },
      fontFamily: {
        // Brand (Cinzel)
        cinzel: ["Cinzel-Regular"],
        "cinzel-semibold": ["Cinzel-SemiBold"],
        "cinzel-bold": ["Cinzel-Bold"],
        "cinzel-extrabold": ["Cinzel-ExtraBold"], // Added ExtraBold

        // Oracle (EB Garamond)
        garamond: ["EBGaramond-Regular"],
        "garamond-medium": ["EBGaramond-Medium"],
        "garamond-italic": ["EBGaramond-Italic"],
        "garamond-bold": ["EBGaramond-Bold"],
      },
      fontSize: {
        "2xs": ["10px", "14px"],
      },
      spacing: {
        18: "72px",
        88: "352px",
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
      },
    },
  },
  plugins: [],
}
