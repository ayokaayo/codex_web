/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
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
                "text-secondary": "#8A8A8A",
                "text-muted": "#5A5A5A",
            },
            fontFamily: {
                cinzel: ["Cinzel", "serif"],
                garamond: ["Cormorant Garamond", "serif"],
                // Explicitly overriding sans to use Cinzel for consistency if needed, or just relying on these two
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
            },
        },
    },
    plugins: [],
}
