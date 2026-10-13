import type { JenisAksi } from "./aksi";
import { aksiTersedia } from "./aksi";
import { AKTIVITAS, TINGKAT, type Aktivitas, type Tingkat } from "./konstanta";
import type { Kartu } from "./schema";

export type Filter = "semua" | "alat" | "tukang" | "ahli";
export type KunciKelompok = Aktivitas | "caregiver";

export interface AksiKartu {
  jenis: JenisAksi;
  /** Tingkat yang dipakai aksi; kosong untuk "ahli" (aksi tingkat kartu). */
  tingkat?: Tingkat;
}

export const adalahPendamping = (k: Kartu): boolean => k.tag.peran?.includes("caregiver") ?? false;

/**
 * Aksi yang bisa langsung dipakai dari sebuah kartu. Tiap aksi memakai tingkat paling ringan
 * yang mendukungnya, dari tingkat yang memang tampil (mis. renovasi tersembunyi di kontrakan).
 */
export function aksiKartu(kartu: Kartu, tingkatTampil: readonly Tingkat[]): AksiKartu[] {
  if (kartu.isi_menyusul || !kartu.solusi) return [];
  const urut = TINGKAT.filter((t) => tingkatTampil.includes(t));
  const hasil: AksiKartu[] = [];
  for (const jenis of ["sendiri", "beli", "tukang"] as const) {
    const tingkat = urut.find((t) => aksiTersedia(kartu, t).includes(jenis));
    if (tingkat) hasil.push({ jenis, tingkat });
  }
  if (kartu.bantuan && kartu.bantuan.length > 0) hasil.push({ jenis: "ahli" });
  return hasil;
}

const jenisFilter: Record<Exclude<Filter, "semua">, JenisAksi> = { alat: "beli", tukang: "tukang", ahli: "ahli" };

/** "semua" menampilkan semua kartu (termasuk kerangka); filter lain hanya kartu yang punya aksi itu. */
export function cocokFilter(kartu: Kartu, tingkatTampil: readonly Tingkat[], filter: Filter): boolean {
  if (filter === "semua") return true;
  return aksiKartu(kartu, tingkatTampil).some((a) => a.jenis === jenisFilter[filter]);
}

/**
 * Mengelompokkan kartu per aktivitas (urutan aktivitas dari asesmen), kartu pendamping di akhir.
 * Dalam satu kelompok, kartu yang sudah berisi tampil sebelum kerangka, lalu urut id.
 * Urutan tidak pernah dipengaruhi tautan atau afiliasi.
 */
export function kelompokkan(kartu: Kartu[], urutanAktivitas: readonly Aktivitas[] = AKTIVITAS): { kunci: KunciKelompok; kartu: Kartu[] }[] {
  const kunciDari = (k: Kartu): KunciKelompok =>
    adalahPendamping(k) ? "caregiver" : (urutanAktivitas.find((a) => k.tag.aktivitas.includes(a)) ?? "umum");
  const urut = [...urutanAktivitas, "caregiver" as const];
  const banding = (a: Kartu, b: Kartu) =>
    Number(!!a.isi_menyusul) - Number(!!b.isi_menyusul) || a.id.localeCompare(b.id);

  return urut
    .map((kunci) => ({ kunci, kartu: kartu.filter((k) => kunciDari(k) === kunci).sort(banding) }))
    .filter((g) => g.kartu.length > 0);
}
