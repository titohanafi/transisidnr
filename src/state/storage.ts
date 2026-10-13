import { z } from "zod";
import { AKTIVITAS } from "../domain/schema";

export const KUNCI = "transisi:v1";
// Foto disimpan terpisah supaya foto besar tidak menggagalkan penyimpanan jawaban.
export const KUNCI_FOTO = "transisi:v1:foto";

export const STATUS_AKTIVITAS = ["bisa_sendiri", "sulit", "ingin_belum_bisa"] as const;

export const asesmenStateSchema = z.object({
  /** Aktivitas yang relevan -> kondisi. Yang tidak ada = tidak relevan. */
  status: z.partialRecord(z.enum(AKTIVITAS), z.enum(STATUS_AKTIVITAS)).default({}),
  /** Satu atau dua aktivitas, urut dari yang terpenting. */
  prioritas: z.array(z.enum(AKTIVITAS)).max(2).default([]),
  /** id pertanyaan -> true (ya) / false (tidak). */
  jawaban: z.record(z.string(), z.boolean()).default({}),
});

export const stateSchema = z.object({
  versi: z.literal(1),
  /** id pertanyaan onboarding -> id pilihan (satu atau lebih). */
  onboarding: z.record(z.string(), z.array(z.string())).default({}),
  asesmen: asesmenStateSchema.default({ status: {}, prioritas: [], jawaban: {} }),
  /** "<id kartu>:<tingkat>" -> nomor langkah (mulai 0) yang sudah dicentang. */
  checklist: z.record(z.string(), z.array(z.number().int().nonnegative())).default({}),
  /** id jawaban check-in caregiver yang terakhir dipilih. */
  checkin: z.string().nullable().default(null),
});
export type State = z.infer<typeof stateSchema>;
export type AsesmenState = z.infer<typeof asesmenStateSchema>;

export const asesmenAwal = (): AsesmenState => ({ status: {}, prioritas: [], jawaban: {} });
export const stateAwal = (): State => ({ versi: 1, onboarding: {}, asesmen: asesmenAwal(), checklist: {}, checkin: null });

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

export function muatFoto(gudang: Gudang | null = gudangBawaan()): string | null {
  try {
    const f = gudang?.getItem(KUNCI_FOTO);
    return f && f.startsWith("data:image/") ? f : null;
  } catch {
    return null;
  }
}

export function simpanFoto(dataUrl: string, gudang: Gudang | null = gudangBawaan()): boolean {
  try {
    gudang?.setItem(KUNCI_FOTO, dataUrl);
    return !!gudang;
  } catch {
    return false; // biasanya kuota penuh
  }
}

export function hapusFoto(gudang: Gudang | null = gudangBawaan()): void {
  try {
    gudang?.removeItem(KUNCI_FOTO);
  } catch {
    /* abaikan */
  }
}

export function hapus(gudang: Gudang | null = gudangBawaan()): void {
  for (const k of [KUNCI, KUNCI_FOTO]) {
    try {
      gudang?.removeItem(k);
    } catch {
      /* tidak ada yang bisa dilakukan */
    }
  }
}
