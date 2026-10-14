import { useEffect, useState } from "react";

const MENGETIK_MS = 55;
const MENGHAPUS_MS = 28;
const TAHAN_MS = 1600;
const JEDA_MS = 350;
const BACA_AWAL_MS = 3000;

/**
 * Placeholder yang "mengetik" contoh satu per satu. Contoh pertama tampil utuh dulu (BACA_AWAL_MS) supaya sempat dibaca,
 * baru dihapus dan berganti. Berhenti (menampilkan contoh pertama utuh) saat `aktif` false,
 * atau bila pengguna meminta gerak dikurangi. Hanya mengubah teks placeholder, jadi tidak mengganggu pembaca layar.
 */
export function usePlaceholderBerjalan(contoh: string[], aktif: boolean): string {
  const [teks, setTeks] = useState(contoh[0] ?? "");
  const kurangiGerak = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const diam = !aktif || kurangiGerak || contoh.length < 2;

  useEffect(() => {
    if (diam) return;
    let batal = false;
    let timer: ReturnType<typeof setTimeout>;
    let i = 0;
    let n = contoh[0].length;
    let menghapus = true;
    // Mulai dari contoh pertama utuh (bukan sisa ketikan sebelumnya), lewat timer agar tidak mengubah state langsung di efek.
    const ulang = setTimeout(() => setTeks(contoh[0]), 0);
    const langkah = () => {
      if (batal) return;
      const kalimat = contoh[i];
      if (!menghapus) {
        n += 1;
        setTeks(kalimat.slice(0, n));
        if (n >= kalimat.length) {
          menghapus = true;
          timer = setTimeout(langkah, TAHAN_MS);
          return;
        }
        timer = setTimeout(langkah, MENGETIK_MS);
      } else {
        n -= 1;
        setTeks(kalimat.slice(0, Math.max(n, 0)));
        if (n <= 0) {
          menghapus = false;
          i = (i + 1) % contoh.length;
          timer = setTimeout(langkah, JEDA_MS);
          return;
        }
        timer = setTimeout(langkah, MENGHAPUS_MS);
      }
    };
    timer = setTimeout(langkah, BACA_AWAL_MS);
    return () => {
      batal = true;
      clearTimeout(ulang);
      clearTimeout(timer);
    };
  }, [diam, contoh]);

  return diam ? (contoh[0] ?? "") : teks;
}
