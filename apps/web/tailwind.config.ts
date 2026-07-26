import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Playfair Display", "serif"],
        mono: ["var(--font-geistmono)", "monospace"],
      },
      colors: {
        "void-black": "var(--color-void-black)",
        ink: "var(--color-ink)",
        obsidian: "var(--color-obsidian)",
        graphite: "var(--color-graphite)",
        smoke: "var(--color-smoke)",
        ash: "var(--color-ash)",
        mist: "var(--color-mist)",
        iron: "var(--color-iron)",
        slate: "var(--color-slate)",
        "pure-white": "var(--color-pure-white)",
        "coral-pulse": "var(--color-coral-pulse)",
        "ember-hush": "var(--color-ember-hush)",
        "electric-sky": "var(--color-electric-sky)",
        "cobalt-edge": "var(--color-cobalt-edge)",
        "deep-space": "var(--color-deep-space)",
        "info-blue": "var(--color-info-blue)",
        "success-green": "var(--color-success-green)",
        "status-success": "var(--color-status-success)",
        "status-error": "var(--color-status-error)",
        "status-warning": "var(--color-status-warning)",
        "status-info": "var(--color-status-info)",
        "status-processing": "var(--color-status-processing)",
        copper: "var(--color-copper)",
        steel: "var(--color-steel)",
        fog: "var(--color-fog)",
        bone: "var(--color-bone)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-down": {
          "0%": { opacity: "0", transform: "translateY(-4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-subtle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "ray-of-light": {
          "0%, 100%": {
            transform: "translateX(-40px) translateY(0) rotate(-12deg) scale(1)",
            opacity: "0.25",
          },
          "50%": {
            transform:
              "translateX(60px) translateY(-30px) rotate(-10deg) scale(1.2)",
            opacity: "0.45",
          },
        },
        "ray-of-light-reverse": {
          "0%, 100%": {
            transform: "translateX(40px) translateY(0) rotate(15deg) scale(1)",
            opacity: "0.15",
          },
          "50%": {
            transform:
              "translateX(-50px) translateY(25px) rotate(18deg) scale(1.15)",
            opacity: "0.3",
          },
        },
        "orb-float": {
          "0%, 100%": {
            transform: "translate(0px, 0px) scale(1)",
            opacity: "0.2",
          },
          "33%": {
            transform: "translate(40px, -30px) scale(1.15)",
            opacity: "0.35",
          },
          "66%": {
            transform: "translate(-30px, 20px) scale(0.9)",
            opacity: "0.25",
          },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.75", transform: "scale(1.08)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.25s ease-out",
        "slide-down": "slide-down 0.25s ease-out",
        "pulse-subtle": "pulse-subtle 2s infinite",
        ray: "ray-of-light 6s ease-in-out infinite",
        "ray-reverse": "ray-of-light-reverse 8s ease-in-out infinite",
        "orb-float": "orb-float 10s ease-in-out infinite",
        "pulse-glow": "pulse-glow 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
