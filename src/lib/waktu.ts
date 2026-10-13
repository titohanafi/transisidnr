export type BagianHari = "pagi" | "siang" | "sore" | "malam";

/** Bagian hari dari jam (0-23) di perangkat pengguna. Murni, supaya mudah diuji. */
export function bagianHari(jam: number): BagianHari {
  if (jam >= 4 && jam < 11) return "pagi";
  if (jam >= 11 && jam < 15) return "siang";
  if (jam >= 15 && jam < 18) return "sore";
  return "malam";
}
