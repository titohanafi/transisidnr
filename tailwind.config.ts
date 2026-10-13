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
        garis: "#CBD2D9", // pembatas dekoratif
        garisKontrol: "#6B7580", // batas kontrol formulir (kontras ≥ 3:1)
        utama: { DEFAULT: "#0F5E63", gelap: "#0A4549", muda: "#E3F1F1" }, // teal tenang
        aksen: { DEFAULT: "#9A4A12", muda: "#FBEBDD" }, // hangat
        draf: { DEFAULT: "#7A4B00", muda: "#FFF1CC" },
        bahaya: "#A32020",
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      borderRadius: { kartu: "16px", tombol: "12px" },
      spacing: { sentuh: "44px" },
      minHeight: { sentuh: "44px" },
      minWidth: { sentuh: "44px" },
      keyframes: { muncul: { from: { opacity: "0", transform: "translateY(6px)" }, to: { opacity: "1", transform: "none" } } },
      animation: { muncul: "muncul 250ms ease-out" },
    },
  },
  plugins: [],
} satisfies Config;
