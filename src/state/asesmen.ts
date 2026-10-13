import type { Aktivitas, Asesmen } from "../domain/schema";
import type { AsesmenState } from "./storage";

export const MAKS_PRIORITAS = 2;

/** Aktivitas yang sulit atau ingin-tapi-belum-bisa; hanya ini yang bisa jadi prioritas. */
export function kandidatPrioritas(asesmen: Asesmen, status: AsesmenState["status"]): Aktivitas[] {
  return asesmen.aktivitas
    .filter((a) => a.bisaDipilihPrioritas)
    .map((a) => a.id)
    .filter((id) => status[id] === "sulit" || status[id] === "ingin_belum_bisa");
}

/** Tahap prioritas hanya perlu bila ada pilihan nyata (dua kandidat atau lebih). */
export const perluTahapPrioritas = (kandidat: Aktivitas[]): boolean => kandidat.length > 1;

export function ubahPrioritas(saatIni: Aktivitas[], id: Aktivitas): Aktivitas[] {
  if (saatIni.includes(id)) return saatIni.filter((x) => x !== id);
  if (saatIni.length >= MAKS_PRIORITAS) return saatIni;
  return [...saatIni, id];
}

/** Pertanyaan yang ditanyakan: aktivitas prioritas (sesuai urutan prioritas), lalu "umum" di akhir. */
export function daftarPertanyaan(asesmen: Asesmen, prioritas: Aktivitas[]) {
  const urut = [...prioritas, ...asesmen.aktivitas.filter((a) => !a.bisaDipilihPrioritas).map((a) => a.id)];
  return urut.flatMap((akt) => asesmen.pertanyaan.filter((p) => p.aktivitas === akt));
}

/**
 * Menjaga data tetap konsisten setelah ada perubahan:
 * - prioritas hanya dari kandidat (otomatis bila hanya ada satu kandidat), maksimal dua;
 * - jawaban hanya untuk pertanyaan yang memang ditanyakan (tidak ada "ya" basi).
 */
export function rapikan(asesmen: Asesmen, s: AsesmenState): AsesmenState {
  const kandidat = kandidatPrioritas(asesmen, s.status);
  const prioritas =
    kandidat.length === 1 ? kandidat : s.prioritas.filter((p) => kandidat.includes(p)).slice(0, MAKS_PRIORITAS);
  const ditanya = new Set(daftarPertanyaan(asesmen, prioritas).map((p) => p.id));
  const jawaban = Object.fromEntries(Object.entries(s.jawaban).filter(([id]) => ditanya.has(id)));
  return { status: s.status, prioritas, jawaban };
}
