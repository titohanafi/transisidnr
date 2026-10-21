import type { Config } from "tailwindcss";

// Semua token desain ada di sini supaya desainer bisa menggantinya.
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        kertas: "#FFFFFF", // latar area aplikasi (putih)
        permukaan: "#F2F6F6", // latar tipis untuk mengelompokkan satu segmen (mis. pencarian)
        luar: "#ECECEA", // latar di luar area aplikasi pada layar lebar
        tinta: "#1F2933", // teks utama (kontras tinggi)
        redup: "#4A5560", // teks sekunder
        garis: "#DCE2E7", // pembatas dekoratif (tipis, lembut)
        garisKontrol: "#6B7580", // batas kontrol formulir (kontras ≥ 3:1)
        utama: { DEFAULT: "#0F5E63", gelap: "#0A4549", muda: "#E3F1F1", redup: "#C2DCDC" }, // teal tenang
        aksen: { DEFAULT: "#9A4A12", muda: "#FBEBDD" }, // hangat
        info: { DEFAULT: "#1D4E89", muda: "#E6F0FA" }, // biru, khusus banner informasi
        draf: { DEFAULT: "#7A4B00", muda: "#FFF1CC" },
        catatan: { DEFAULT: "#5C3D00", muda: "#FFF3C4", garis: "#E8CF7A" }, // kuning lembut untuk catatan yang bisa ditutup
        daun: "#8FD27A", // hijau daun muda, warna ikon kartu utama di atas teal (kontras ≈ 4,2:1)
        bahaya: { DEFAULT: "#A32020", muda: "#FDEDED" },
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      borderRadius: { kartu: "16px", tombol: "12px" },
      // Bayangan halus pengganti garis tebal: memberi kedalaman tanpa terlihat berat.
      boxShadow: {
        kartu: "0 1px 2px rgba(31,41,51,0.06), 0 2px 8px rgba(31,41,51,0.05)",
        angkat: "0 4px 14px rgba(15,94,99,0.18)",
      },
      // Skala tipografi dan ritme jarak (desainer cukup mengubah di sini).
      fontSize: {
        judul: ["1.625rem", { lineHeight: "1.25", fontWeight: "700", letterSpacing: "-0.015em" }], // judul halaman (h1)
        subjudul: ["1.25rem", { lineHeight: "1.35", fontWeight: "700", letterSpacing: "-0.01em" }], // judul bagian (h2)
        judulUtama: ["1.1875rem", { lineHeight: "1.3", fontWeight: "700", letterSpacing: "-0.01em" }], // judul kartu utama Beranda
        judulKartu: ["1.0625rem", { lineHeight: "1.4", fontWeight: "600" }], // judul kartu / sub-bagian (h3)
        isi: ["1rem", { lineHeight: "1.5" }],
        kecil: ["0.875rem", { lineHeight: "1.45" }],
        mikro: ["0.8125rem", { lineHeight: "1.3" }],
      },
      spacing: { sentuh: "44px", jeda: "32px", bagian: "24px", isi: "12px" }, // jeda: pemisah kelompok besar; bagian: antar-bagian; isi: judul ke isi
      minHeight: { sentuh: "44px" },
      minWidth: { sentuh: "44px" },
      keyframes: {
        muncul: { from: { opacity: "0", transform: "translateY(6px)" }, to: { opacity: "1", transform: "none" } },
        pindai: { "0%, 100%": { top: "-10%" }, "50%": { top: "100%" } },
        // Dipakai saat satu hal di "Rincian per indikator" dikoreksi ke status lain: kartunya tidak langsung hilang
        // dari tab (yang bikin terasa seperti "tidak ada perubahan" karena kartu berikutnya langsung naik), tapi
        // melewati fase "terisi" (pilnya sempat terlihat terisi dulu) lalu "konfirmasi" (teks "Dipindahkan ke ..."
        // muncul sambil memudar keluar) - jeda antar-fase diatur lewat setTimeout di PindaiFoto.tsx, bukan di sini,
        // jadi animasi ini cuma pudarnya saja (dipasang tepat saat fase "konfirmasi" dimulai).
        pudar: { "0%": { opacity: "1" }, "100%": { opacity: "0" } },
      },
      animation: {
        muncul: "muncul 250ms ease-out",
        pindai: "pindai 2.4s cubic-bezier(0.65,0,0.35,1) infinite",
        pudar: "pudar 500ms ease-in forwards",
      },
    },
  },
  plugins: [],
} satisfies Config;
