// Pencatat kejadian. Bawaannya TIDAK mengirim apa pun keluar perangkat.
// Cara memasang analitik yang ramah privasi: lihat README ("Analitik").

export type NamaKejadian = "rencana_dibuat" | "kartu_dibuka" | "aksi_klik" | "brief_dibuat";
export type Props = Record<string, string | number | boolean>;
export type Pengirim = (nama: NamaKejadian, props: Props) => void;

let pengirim: Pengirim | null = null;

/** Memasang pengirim analitik sendiri. Beri null untuk mematikan. */
export function setPengirim(p: Pengirim | null): void {
  pengirim = p;
}

/** Hanya angka, teks pendek, dan boolean yang lolos; tidak ada objek atau data bebas. */
function bersihkan(props: Props): Props {
  const hasil: Props = {};
  for (const [k, v] of Object.entries(props)) {
    if (typeof v === "string") hasil[k] = v.slice(0, 64);
    else if (typeof v === "number" || typeof v === "boolean") hasil[k] = v;
  }
  return hasil;
}

export function track(nama: NamaKejadian, props: Props = {}): void {
  const bersih = bersihkan(props);
  if (import.meta.env?.DEV) console.debug("[track]", nama, bersih);
  try {
    pengirim?.(nama, bersih);
  } catch {
    /* analitik tidak boleh merusak aplikasi */
  }
}
