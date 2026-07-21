import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        midnight: "#090d1d",
        indigoSmoke: "#151a32",
        pearl: "#f7f2e9",
        parchment: "#eadcc1",
        lavenderMist: "#b9a4cf",
        thread: "#c6b676",
        ink: "#252031",
      },
      fontFamily: {
        display: ["Cormorant Garamond", "Georgia", "serif"],
        body: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        paper: "0 28px 80px rgba(8, 11, 27, 0.35)",
        glow: "0 0 42px rgba(198, 182, 118, 0.18)",
      },
    },
  },
  plugins: [],
} satisfies Config;
