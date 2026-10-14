import { TINGKAT } from "./konstanta";
import type { Kartu, Tingkat } from "./schema";

/** Mencentang atau melepas satu langkah; hasilnya selalu terurut naik. */
export function ubahCentang(ada: readonly number[], nomor: number): number[] {
  return ada.includes(nomor) ? ada.filter((n) => n !== nomor) : [...ada, nomor].sort((a, b) => a - b);
}

export type Dorongan = "mulai" | "separuh" | "selesai";

export interface RingkasanLangkah {
  /** Nomor langkah yang tercentang dan masih ada di daftar (centang usang diabaikan, mis. langkah dihapus dari konten). */
  selesai: number[];
  semuaSelesai: boolean;
  /** Pesan penyemangat; null bila belum ada yang dicentang. */
  dorongan: Dorongan | null;
}

export function ringkasLangkah(tercentang: readonly number[], total: number): RingkasanLangkah {
  const selesai = [...new Set(tercentang.filter((n) => Number.isInteger(n) && n >= 0 && n < total))].sort((a, b) => a - b);
  const semuaSelesai = total > 0 && selesai.length === total;
  const dorongan: Dorongan | null =
    selesai.length === 0 ? null : semuaSelesai ? "selesai" : selesai.length * 2 >= total ? "separuh" : "mulai";
  return { selesai, semuaSelesai, dorongan };
}

/** Tingkat solusi berikutnya yang ada isinya setelah tingkat ini, atau undefined bila sudah yang terakhir. */
export function tingkatSetelah(kartu: Pick<Kartu, "solusi">, tingkat: Tingkat): Tingkat | undefined {
  return TINGKAT.find((x) => TINGKAT.indexOf(x) > TINGKAT.indexOf(tingkat) && kartu.solusi?.[x]);
}
