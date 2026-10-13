import { z } from "zod";

export const KUNCI = "transisi:v1";

export const stateSchema = z.object({
  versi: z.literal(1),
  /** id pertanyaan onboarding -> id pilihan (satu atau lebih). */
  onboarding: z.record(z.string(), z.array(z.string())).default({}),
});
export type State = z.infer<typeof stateSchema>;

export const stateAwal = (): State => ({ versi: 1, onboarding: {} });

type Gudang = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function gudangBawaan(): Gudang | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null; // diblokir (mode privat, dll.)
  }
}

// Semua fungsi aman dipanggil walau penyimpanan tidak tersedia atau isinya rusak.
export function muat(gudang: Gudang | null = gudangBawaan()): State {
  try {
    const mentah = gudang?.getItem(KUNCI);
    if (!mentah) return stateAwal();
    const r = stateSchema.safeParse(JSON.parse(mentah));
    return r.success ? r.data : stateAwal();
  } catch {
    return stateAwal();
  }
}

export function simpan(state: State, gudang: Gudang | null = gudangBawaan()): boolean {
  try {
    gudang?.setItem(KUNCI, JSON.stringify(state));
    return !!gudang;
  } catch {
    return false;
  }
}

export function hapus(gudang: Gudang | null = gudangBawaan()): void {
  try {
    gudang?.removeItem(KUNCI);
  } catch {
    /* tidak ada yang bisa dilakukan */
  }
}
