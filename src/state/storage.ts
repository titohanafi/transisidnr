import { AKTIVITAS, TINGKAT, type Aktivitas, type Tingkat } from "../domain/konstanta";

export const KUNCI = "transisi:v1";
// Foto disimpan terpisah supaya foto besar tidak menggagalkan penyimpanan jawaban.
export const KUNCI_FOTO = "transisi:v1:foto";

export const STATUS_AKTIVITAS = ["bisa_sendiri", "sulit", "ingin_belum_bisa"] as const;
export type StatusAktivitas = (typeof STATUS_AKTIVITAS)[number];

export interface AsesmenState {
  /** Aktivitas yang relevan -> kondisi. Yang tidak ada = tidak relevan. */
  status: Partial<Record<Aktivitas, StatusAktivitas>>;
  /** Satu atau dua aktivitas, urut dari yang terpenting. */
  prioritas: Aktivitas[];
  /** id pertanyaan -> true (ya) / false (tidak). */
  jawaban: Record<string, boolean>;
}

export const STATUS_HASIL = ["cukup", "masih_sulit"] as const;
export type StatusHasil = (typeof STATUS_HASIL)[number];
/** Hasil setelah mencoba satu tingkat sebuah panduan. */
export interface HasilPanduan {
  status: StatusHasil;
  tingkat: Tingkat;
}

export interface State {
  versi: 1;
  /** id pertanyaan onboarding -> id pilihan (satu atau lebih). */
  onboarding: Record<string, string[]>;
  asesmen: AsesmenState;
  /** "<id kartu>:<tingkat>" -> nomor langkah (mulai 0) yang sudah dicentang. */
  checklist: Record<string, number[]>;
  /** id jawaban check-in caregiver yang terakhir dipilih. */
  checkin: string | null;
  /** id panduan -> hasil setelah dicoba ("sudah cukup" atau "masih sulit"). */
  hasil: Record<string, HasilPanduan>;
}

export const asesmenAwal = (): AsesmenState => ({ status: {}, prioritas: [], jawaban: {} });
export const stateAwal = (): State => ({ versi: 1, onboarding: {}, asesmen: asesmenAwal(), checklist: {}, checkin: null, hasil: {} });

// Validasi tulisan tangan (tanpa pustaka) agar bundel kecil. Data yang bentuknya salah ditolak seluruhnya.
const adalahObjek = (x: unknown): x is Record<string, unknown> => typeof x === "object" && x !== null && !Array.isArray(x);
const adalahTeks = (x: unknown): x is string => typeof x === "string";
const arrayDari = <T>(x: unknown, ok: (v: unknown) => v is T): T[] | null =>
  Array.isArray(x) && x.every(ok) ? (x as T[]) : null;
const rekam = <T>(x: unknown, ok: (v: unknown) => v is T): Record<string, T> | null =>
  adalahObjek(x) && Object.values(x).every(ok) ? (x as Record<string, T>) : null;
const adalahAktivitas = (x: unknown): x is Aktivitas => (AKTIVITAS as readonly unknown[]).includes(x);
const adalahStatus = (x: unknown): x is StatusAktivitas => (STATUS_AKTIVITAS as readonly unknown[]).includes(x);
const adalahBool = (x: unknown): x is boolean => typeof x === "boolean";
const adalahHasil = (x: unknown): x is HasilPanduan =>
  adalahObjek(x) &&
  (STATUS_HASIL as readonly unknown[]).includes(x.status) &&
  (TINGKAT as readonly unknown[]).includes(x.tingkat);
const adalahNomor = (x: unknown): x is number => Number.isInteger(x) && (x as number) >= 0;

/** Mengubah data mentah menjadi State, atau null bila bentuknya salah. Bagian yang hilang diisi bawaan. */
export function parseState(x: unknown): State | null {
  if (!adalahObjek(x) || x.versi !== 1) return null;
  const awal = stateAwal();

  const onboarding = x.onboarding === undefined ? awal.onboarding : rekam(x.onboarding, (v): v is string[] => arrayDari(v, adalahTeks) !== null);
  const checklist = x.checklist === undefined ? awal.checklist : rekam(x.checklist, (v): v is number[] => arrayDari(v, adalahNomor) !== null);
  if (!onboarding || !checklist) return null;

  let asesmen = awal.asesmen;
  if (x.asesmen !== undefined) {
    const a = x.asesmen;
    if (!adalahObjek(a)) return null;
    const status = a.status === undefined ? {} : rekam(a.status, adalahStatus);
    const prioritas = a.prioritas === undefined ? [] : arrayDari(a.prioritas, adalahAktivitas);
    const jawaban = a.jawaban === undefined ? {} : rekam(a.jawaban, adalahBool);
    if (!status || !prioritas || prioritas.length > 2 || !jawaban) return null;
    if (!Object.keys(status).every(adalahAktivitas)) return null;
    asesmen = { status: status as AsesmenState["status"], prioritas, jawaban };
  }

  const checkin = x.checkin === undefined || x.checkin === null ? null : adalahTeks(x.checkin) ? x.checkin : undefined;
  if (checkin === undefined) return null;

  const hasil = x.hasil === undefined ? awal.hasil : rekam(x.hasil, adalahHasil);
  if (!hasil) return null;

  // Hanya bidang yang dikenal yang dibawa (hasil dibersihkan dari kunci asing).
  const bersih = Object.fromEntries(Object.entries(hasil).map(([k, v]) => [k, { status: v.status, tingkat: v.tingkat }]));
  return { versi: 1, onboarding, asesmen, checklist, checkin, hasil: bersih };
}

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
    return parseState(JSON.parse(mentah)) ?? stateAwal();
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
