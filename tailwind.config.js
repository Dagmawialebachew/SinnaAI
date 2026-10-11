/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Palettes directly derived from sinna_color_palettes.jpg
        brand: {
          // Clinical Sapphire (Primary default)
          primary: "#1A4F9E",    // Royal Medical Deep Blue
          accent: "#00BFFF",     // Bright Cyan Highlight
          surface: "#F0F7FF",    // Tinted subtle blue fill
          hover: "#143E7D",      // Deep sapphire press
          subtle: "#F8FAFC",     // Alabaster clinical canvas
        },
        forest: {
          // Imperial Forest
          primary: "#005A3E",    // Deep Ethiopian Forest Green
          accent: "#008F7E",     // Luminous Teal
          surface: "#E8F5F1",    // Soft Forest tint
          bg: "#F4F3ED",         // Warm Alabaster
        },
        sage: {
          // Modern Sage & Sand
          primary: "#5A7D6C",
          accent: "#94B4A4",
          sand: "#EADEC9",
          gold: "#C1A470",
        },
        obsidian: {
          // Obsidian Mint
          slate: "#2B303A",
          mint: "#4FFFB0",
          platinum: "#EAECEF",
        },
        slate: {
          950: "#0A0F1D",
          900: "#0F172A",
          800: "#1E293B",
          700: "#334155",
          600: "#475569",
          500: "#64748B",
          400: "#94A3B8",
          300: "#CBD5E1",
          200: "#E2E8F0",
          100: "#F1F5F9",
          50: "#F8FAFC",
        },
        status: {
          confirmed: "#059669",
          confirmedBg: "#ECFDF5",
          inProgress: "#1A4F9E",
          inProgressBg: "#EFF6FF",
          pending: "#D97706",
          pendingBg: "#FFFBEB",
          cancelled: "#DC2626",
          cancelledBg: "#FEF2F2",
          completed: "#0D9488",
          completedBg: "#F0FDFA",
        }
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        amharic: ["'Noto Sans Ethiopic'", "Nyala", "'Abyssinica SIL'", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      keyframes: {
        springPop: {
          '0%': { transform: 'scale(0.97)', opacity: '0' },
          '60%': { transform: 'scale(1.01)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        'spring-pop': 'springPop 200ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.04)",
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 6px 16px -4px rgba(0, 0, 0, 0.04)",
        dropdown: "0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)",
        float: "0 20px 35px -10px rgba(26, 79, 158, 0.12)",
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.25rem',
        '4xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
