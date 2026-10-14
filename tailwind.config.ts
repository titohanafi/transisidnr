import type { Config } from "tailwindcss";

// Semua token desain ada di sini supaya desainer bisa menggantinya.
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        kertas: "#FFFFFF", // latar area aplikasi (putih)
        permukaan: "#F2F6F6", // latar tipis untuk mengelompokkan satu segmen (mis. pencarian)
        luar: "#0A4549", // latar di luar area aplikasi pada layar lebar
        tinta: "#1F2933", // teks utama (kontras tinggi)
        redup: "#4A5560", // teks sekunder
        garis: "#CBD2D9", // pembatas dekoratif
        garisKontrol: "#6B7580", // batas kontrol formulir (kontras ≥ 3:1)
        utama: { DEFAULT: "#0F5E63", gelap: "#0A4549", muda: "#E3F1F1" }, // teal tenang
        aksen: { DEFAULT: "#9A4A12", muda: "#FBEBDD" }, // hangat
        info: { DEFAULT: "#1D4E89", muda: "#E6F0FA" }, // biru, khusus banner informasi
        draf: { DEFAULT: "#7A4B00", muda: "#FFF1CC" },
        bahaya: "#A32020",
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      borderRadius: { kartu: "16px", tombol: "12px" },
      // Skala tipografi dan ritme jarak (desainer cukup mengubah di sini).
      fontSize: {
        judul: ["1.5rem", { lineHeight: "1.3", fontWeight: "700" }],
        subjudul: ["1.25rem", { lineHeight: "1.35", fontWeight: "700" }],
        isi: ["1rem", { lineHeight: "1.5" }],
        kecil: ["0.875rem", { lineHeight: "1.45" }],
        mikro: ["0.8125rem", { lineHeight: "1.3" }],
      },
      spacing: { sentuh: "44px", bagian: "24px", isi: "12px" },
      minHeight: { sentuh: "44px" },
      minWidth: { sentuh: "44px" },
      keyframes: { muncul: { from: { opacity: "0", transform: "translateY(6px)" }, to: { opacity: "1", transform: "none" } } },
      animation: { muncul: "muncul 250ms ease-out" },
    },
  },
  plugins: [],
} satisfies Config;
