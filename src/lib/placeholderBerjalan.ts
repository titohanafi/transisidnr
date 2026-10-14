import { useEffect, useState } from "react";

const MENGETIK_MS = 55;
const MENGHAPUS_MS = 28;
const TAHAN_MS = 1600;
const JEDA_MS = 350;

/**
 * Placeholder yang "mengetik" contoh satu per satu. Berhenti (menampilkan contoh pertama utuh) saat `aktif` false,
 * atau bila pengguna meminta gerak dikurangi. Hanya mengubah teks placeholder, jadi tidak mengganggu pembaca layar.
 */
export function usePlaceholderBerjalan(awalan: string, contoh: string[], aktif: boolean): string {
  const [teks, setTeks] = useState("");
  const kurangiGerak = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const diam = !aktif || kurangiGerak || contoh.length < 2;

  useEffect(() => {
    if (diam) return;
    let batal = false;
    let timer: ReturnType<typeof setTimeout>;
    let i = 0;
    let n = 0;
    let menghapus = false;
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
    timer = setTimeout(langkah, JEDA_MS);
    return () => {
      batal = true;
      clearTimeout(timer);
    };
  }, [diam, contoh]);

  return awalan + (diam ? (contoh[0] ?? "") : teks);
}
