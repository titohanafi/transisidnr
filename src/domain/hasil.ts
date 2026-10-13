import { TINGKAT, type Tingkat } from "./konstanta";
import type { KartuRencana, Rencana, SatuHal } from "./engine";
import type { Kartu } from "./schema";

export interface HasilPanduan {
  status: "cukup" | "masih_sulit";
  tingkat: Tingkat;
}

/** Tingkat yang tampil dan lebih besar daripada `setelah` (urutan: tanpa biaya, alat, renovasi). */
export function tingkatBerikutnya(k: Pick<KartuRencana, "tingkat">, setelah: Tingkat): Tingkat | undefined {
  const batas = TINGKAT.indexOf(setelah);
  return k.tingkat.find((t) => t.tampil && TINGKAT.indexOf(t.tingkat) > batas)?.tingkat;
}

export interface RencanaDenganHasil {
  satuHal: SatuHal | null;
  mulai: KartuRencana[];
  lainnya: KartuRencana[];
  beres: KartuRencana[];
  /** Jumlah panduan yang berisi di daftar (kartu kerangka tidak dihitung). */
  jumlahPanduan: number;
}

/**
 * Menyesuaikan rencana dengan hasil yang dicatat pengguna: panduan yang "sudah cukup" pindah ke
 * "beres", dan panduan yang "masih sulit" diarahkan ke tingkat berikutnya. Fungsi murni.
 */
export function terapkanHasil(rencana: Rencana, hasil: Record<string, HasilPanduan>, kartu: Kartu[]): RencanaDenganHasil {
  const beres = rencana.daftar.filter((k) => hasil[k.id]?.status === "cukup");
  const aktif = rencana.daftar.filter((k) => hasil[k.id]?.status !== "cukup");
  const mulai = rencana.mulaiDariSini.filter((k) => hasil[k.id]?.status !== "cukup");
  const lainnya = aktif.filter((k) => !mulai.some((m) => m.id === k.id));

  let satuHal: SatuHal | null = null;
  const pertama = mulai[0];
  if (pertama) {
    const h = hasil[pertama.id];
    const berikut = h?.status === "masih_sulit" ? tingkatBerikutnya(pertama, h.tingkat) : undefined;
    if (berikut) {
      const langkah = kartu.find((c) => c.id === pertama.id)?.solusi?.[berikut]?.langkah[0];
      if (langkah) satuHal = { kartuId: pertama.id, tingkat: berikut, langkah };
    } else if (rencana.satuHalHariIni?.kartuId === pertama.id) {
      satuHal = rencana.satuHalHariIni;
    } else {
      const t = pertama.tingkat.find((x) => x.tampil && !x.ditandaiPermanen);
      const langkah = t && kartu.find((c) => c.id === pertama.id)?.solusi?.[t.tingkat]?.langkah[0];
      if (t && langkah) satuHal = { kartuId: pertama.id, tingkat: t.tingkat, langkah };
    }
  }

  return { satuHal, mulai, lainnya, beres, jumlahPanduan: rencana.daftar.filter((k) => !k.isiMenyusul).length };
}
