import type { Ui } from "./schema";

/** Istilah teknis yang muncul di teks kartu, supaya bisa dijelaskan satu kalimat. */
export function istilahDalam(teks: string, daftar: Ui["istilah"]): Ui["istilah"] {
  const bawah = teks.toLowerCase();
  return daftar.filter((i) => bawah.includes(i.kata.toLowerCase()));
}
