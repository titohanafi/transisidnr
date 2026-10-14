export const STATUS_ITEM = ["ramah", "perhatian", "tidak_jelas"] as const;
export type StatusItem = (typeof STATUS_ITEM)[number];
export type TingkatRamah = "belum_cukup" | "banyak" | "sebagian" | "cukup";

export interface Skor {
  tingkat: TingkatRamah;
  ramah: number;
  perhatian: number;
  tidakJelas: number;
  /** Jumlah hal yang terlihat jelas (ramah + perhatian). */
  jelas: number;
}

// Ambang ini heuristik awal (bukan angka klinis) dan perlu ditinjau ahli; lihat DECISIONS.md.
export const MIN_JELAS = 4;
export const AMBANG_CUKUP = 0.8;
export const AMBANG_SEBAGIAN = 0.5;

/** Fungsi murni: skor dihitung dari temuan per hal, bukan dari angka yang diberikan model. */
export function hitungSkor(temuan: Record<string, StatusItem>, idItem: string[]): Skor {
  let ramah = 0;
  let perhatian = 0;
  let tidakJelas = 0;
  for (const id of idItem) {
    const s = temuan[id] ?? "tidak_jelas";
    if (s === "ramah") ramah++;
    else if (s === "perhatian") perhatian++;
    else tidakJelas++;
  }
  const jelas = ramah + perhatian;
  let tingkat: TingkatRamah;
  if (jelas < MIN_JELAS) tingkat = "belum_cukup";
  else if (ramah / jelas >= AMBANG_CUKUP) tingkat = "cukup";
  else if (ramah / jelas >= AMBANG_SEBAGIAN) tingkat = "sebagian";
  else tingkat = "banyak";
  return { tingkat, ramah, perhatian, tidakJelas, jelas };
}
