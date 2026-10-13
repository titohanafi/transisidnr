import type { Config } from "tailwindcss";

// Semua token desain ada di sini supaya desainer bisa menggantinya.
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        kertas: "#FAF8F5", // latar hangat
        tinta: "#1F2933", // teks utama (kontras tinggi)
        redup: "#4A5560", // teks sekunder
        garis: "#CBD2D9",
        utama: { DEFAULT: "#0F5E63", gelap: "#0A4549", muda: "#E3F1F1" }, // teal tenang
        aksen: { DEFAULT: "#9A4A12", muda: "#FBEBDD" }, // hangat
        draf: { DEFAULT: "#7A4B00", muda: "#FFF1CC" },
        bahaya: "#A32020",
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      borderRadius: { kartu: "12px", tombol: "10px" },
      spacing: { sentuh: "44px" },
      minHeight: { sentuh: "44px" },
      minWidth: { sentuh: "44px" },
    },
  },
  plugins: [],
} satisfies Config;
