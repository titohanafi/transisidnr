import type { Kartu, Tingkat } from "./schema";

export type JenisAksi = "sendiri" | "beli" | "tukang" | "ahli";

/** Aksi utama per tingkat; "beli" hanya bila tingkat itu punya barang. */
export function aksiUtama(tingkat: Tingkat, jumlahBarang: number): Exclude<JenisAksi, "ahli"> {
  if (tingkat === "renovasi") return "tukang";
  if (tingkat === "alat_tanpa_bongkar" && jumlahBarang > 0) return "beli";
  return "sendiri";
}

/** Aksi yang masuk akal untuk satu tingkat sebuah kartu. */
export function aksiTersedia(kartu: Kartu, tingkat: Tingkat): Exclude<JenisAksi, "ahli">[] {
  const s = kartu.solusi?.[tingkat];
  if (!s) return [];
  const hasil: Exclude<JenisAksi, "ahli">[] = ["sendiri"];
  if (s.barang.length > 0) hasil.push("beli");
  if (tingkat !== "tanpa_biaya" && kartu.bantuan?.some((b) => b.jenis === "tukang")) hasil.push("tukang");
  return hasil;
}

export function jalurAksi(jenis: JenisAksi, kartuId: string, tingkat?: Tingkat): string {
  return jenis === "ahli" || !tingkat ? `/aksi/ahli/${kartuId}` : `/aksi/${jenis}/${kartuId}/${tingkat}`;
}

export const kunciChecklist = (kartuId: string, tingkat: Tingkat): string => `${kartuId}:${tingkat}`;
