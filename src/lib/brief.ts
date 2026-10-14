import type { Brief, Kartu, Tingkat } from "../domain/schema";
import { isi } from "./teks";

export interface Butir {
  id: string;
  ikut: boolean;
  teks: string;
}

export interface BahanBrief {
  kartu: Kartu;
  tingkat: Tingkat;
  /** Label hunian dari onboarding, mis. "Kontrakan"; null bila belum dijawab. */
  hunianId: string | null;
  hunianLabel: string | null;
  /** Label budget; null atau "belum tahu" menjadi teks "belum tahu". */
  budgetLabel: string | null;
  budgetBelumTahu: boolean;
  adaFoto: boolean;
  /** Nama ruangan dari tag kartu; null bila tidak diketahui (butir ruangan dilewati). */
  ruanganLabel?: string | null;
}

/**
 * Menyusun butir brief untuk tukang. Sengaja TIDAK menerima data medis atau tanggal kejadian,
 * jadi tidak mungkin ikut tertulis.
 */
export function butirBrief(b: BahanBrief, t: Brief): Butir[] {
  const s = b.kartu.solusi?.[b.tingkat];
  const butir: Butir[] = [
    { id: "sapaan", ikut: true, teks: t.sapaan },
    ...(b.ruanganLabel ? [{ id: "ruangan", ikut: true, teks: isi(t.ruangan, { ruangan: b.ruanganLabel }) }] : []),
    { id: "masalah", ikut: true, teks: isi(t.masalah, { judul: b.kartu.judul }) },
  ];
  if (s) {
    butir.push({
      id: "modifikasi",
      ikut: true,
      teks: [t.modifikasi, s.ringkasan, ...s.langkah.map((l) => `- ${l}`)].join("\n"),
    });
  }
  // Butir pilihan (tidak dicentang dari awal): hanya relevan untuk alat yang bisa dibuatkan tukang.
  if (b.tingkat === "alat_tanpa_bongkar") butir.push({ id: "alat_khusus", ikut: false, teks: t.alatKhusus });
  if (b.hunianLabel) {
    const sewa = b.hunianId === "kontrakan" || b.hunianId === "kos";
    butir.push({
      id: "hunian",
      ikut: true,
      teks: isi(t.hunian, { hunian: b.hunianLabel }) + (sewa ? `. ${t.izinPemilik}` : ""),
    });
  }
  butir.push({
    id: "budget",
    ikut: true,
    teks: isi(t.budget, { budget: b.budgetLabel && !b.budgetBelumTahu ? b.budgetLabel : t.budgetBelumTahu }),
  });
  if (b.adaFoto) butir.push({ id: "foto", ikut: true, teks: t.fotoTerpisah });
  return butir;
}

/** Menggabungkan butir yang dicentang dan tidak kosong menjadi satu pesan. */
export function susunBrief(butir: Butir[]): string {
  return butir
    .filter((x) => x.ikut && x.teks.trim() !== "")
    .map((x) => x.teks.trim())
    .join("\n\n");
}

/** Tautan WhatsApp tanpa nomor; teks di-encode. */
export const urlWhatsApp = (teks: string): string => `https://wa.me/?text=${encodeURIComponent(teks)}`;
