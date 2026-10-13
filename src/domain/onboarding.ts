import type { Config, Onboarding } from "./schema";

export interface PilihanOnboarding {
  id: string;
  label: string;
  bulanMaks?: number | null;
  /** Balasan hangat yang tampil setelah pilihan ini dipilih (opsional). */
  respons?: string;
}

type Pertanyaan = Onboarding["pertanyaan"][number];

/** Daftar pilihan sebuah pertanyaan. Untuk budget, daftar dibaca dari config.json (satu sumber). */
export function pilihanPertanyaan(q: Pertanyaan | undefined, config: Config): PilihanOnboarding[] {
  if (!q) return [];
  if (q.pilihanDari === "budget") return config.budget.map((b) => ({ id: b.id, label: b.label }));
  return q.pilihan ?? [];
}
