import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sidebar: {
          bg: "#1e1b4b",
          text: "#ffffff",
          active: "#3730a3",
        },
        accent: {
          DEFAULT: "#4338ca",
          hover: "#3730a3",
        },
        urgensi: {
          tinggi: "#ef4444",
          sedang: "#f59e0b",
          rendah: "#22c55e",
        },
        status: {
          berjalan: "#f59e0b",
          selesai: "#3b82f6",
          tertunda: "#ef4444",
        },
      },
    },
  },
  plugins: [],
};

export default config;
