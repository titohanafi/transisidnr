// Aturan pilihan onboarding sebagai fungsi murni (mudah dites).

/** Pilihan yang berarti "tidak ada"; tidak boleh dipilih bersama pilihan lain. */
const PILIHAN_TUNGGAL = new Set(["belum_ada"]);

export function ubahPilihan(banyak: boolean, saatIni: string[], id: string): string[] {
  if (!banyak) return [id];
  if (saatIni.includes(id)) return saatIni.filter((x) => x !== id);
  if (PILIHAN_TUNGGAL.has(id)) return [id];
  return [...saatIni.filter((x) => !PILIHAN_TUNGGAL.has(x)), id];
}

export const bisaLanjut = (saatIni: string[] | undefined): boolean => !!saatIni && saatIni.length > 0;
