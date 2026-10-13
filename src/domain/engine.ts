import type { Aktivitas, Asesmen, Config, Kartu, Tingkat } from "./schema";
import { TINGKAT } from "./schema";

export type StatusAktivitas = "bisa_sendiri" | "sulit" | "ingin_belum_bisa";

export interface Masukan {
  hunian: string | null;
  protesis: "ya" | "belum_tahu" | "tidak" | null;
  /** Batas atas bulan dari jawaban kejadian (null = lebih dari 6 bulan / belum dijawab). */
  kejadianBulanMaks: number | null;
  /** id rentang budget dari config.json, atau null. */
  budget: string | null;
  statusAktivitas: Partial<Record<Aktivitas, StatusAktivitas>>;
  /** Satu atau dua aktivitas, urut dari yang terpenting. */
  prioritas: Aktivitas[];
  /** id pertanyaan asesmen -> jawaban ya (true) / tidak (false). */
  jawaban: Record<string, boolean>;
}

export interface TingkatRencana {
  tingkat: Tingkat;
  sifat: "sementara" | "permanen";
  tampil: boolean;
  /** Permanen dan kebutuhan jangka panjang belum jelas: "tunggu dulu". */
  ditandaiPermanen: boolean;
  /** Permanen dan hunian kontrakan/kos: disembunyikan (perlu izin pemilik). */
  disembunyikanHunian: boolean;
  /** Alat tanpa bongkar untuk kontrakan/kos. */
  ditonjolkan: boolean;
  /** Kisaran biaya diketahui dan seluruhnya di atas budget. */
  diAtasBudget: boolean;
}

export interface KartuRencana {
  id: string;
  prioritas: boolean;
  isiMenyusul: boolean;
  tingkat: TingkatRencana[];
}

export interface SatuHal {
  kartuId: string;
  tingkat: Tingkat;
  langkah: string;
}

export interface Rencana {
  satuHalHariIni: SatuHal | null;
  mulaiDariSini: KartuRencana[];
  daftar: KartuRencana[];
  /** Kartu pendamping caregiver; tampil di bagian bawah, termasuk saat daftar kosong. */
  pendamping: string | null;
  /** daftar lalu pendamping; urutan tampil di layar. */
  urutanTampil: string[];
  tampilkanCheckin: true;
  kosong: boolean;
  kebutuhanJangkaPanjangBelumJelas: boolean;
  total: { diketahui: true; minRp: number; maksRp: number } | { diketahui: false };
}

export interface Rentang {
  min: number;
  max: number;
}

const SATUAN: Record<string, number> = { juta: 1_000_000, jt: 1_000_000, ribu: 1_000, rb: 1_000 };

/**
 * Membaca teks kisaran seperti "Rp 0", "Rp 500.000", "Rp 500 ribu - 2 juta".
 * Mengembalikan null bila tidak bisa dibaca dengan pasti.
 */
export function bacaKisaranRp(teks: string | null | undefined): Rentang | null {
  if (!teks) return null;
  const nilai: number[] = [];
  for (const m of teks.matchAll(/(\d+(?:[.,]\d+)*)\s*(juta|jt|ribu|rb)?/gi)) {
    const angka = m[1];
    const satuan = m[2]?.toLowerCase();
    let n: number;
    if (satuan) n = parseFloat(angka.replace(",", ".")) * SATUAN[satuan];
    else if (/^\d{1,3}(\.\d{3})+$/.test(angka)) n = parseInt(angka.replace(/\./g, ""), 10);
    else if (/^\d+$/.test(angka)) n = parseInt(angka, 10);
    else return null;
    if (!Number.isFinite(n)) return null;
    nilai.push(n);
  }
  if (nilai.length === 0) return null;
  return { min: Math.min(...nilai), max: Math.max(...nilai) };
}

const adalahPendamping = (k: Kartu) => k.tag.peran?.includes("caregiver") ?? false;

export function buatRencana(masukan: Masukan, kartu: Kartu[], asesmen: Asesmen, config: Config): Rencana {
  const kartuPerId = new Map(kartu.map((k) => [k.id, k]));
  const belumJelas =
    (masukan.kejadianBulanMaks !== null && masukan.kejadianBulanMaks <= config.faseAwalBulan) ||
    masukan.protesis !== "tidak";
  const sewa = masukan.hunian === "kontrakan" || masukan.hunian === "kos";
  const maksBudget = config.budget.find((b) => b.id === masukan.budget)?.maksRp ?? null;

  // Kartu terpicu: urutan kemunculan di asesmen, dengan aktivitas pemicunya.
  const pemicu = new Map<string, Set<Aktivitas>>();
  for (const p of asesmen.pertanyaan) {
    if (masukan.jawaban[p.id] !== true) continue;
    for (const id of p.memicu_kartu) {
      const k = kartuPerId.get(id);
      if (!k || adalahPendamping(k)) continue;
      if (!pemicu.has(id)) pemicu.set(id, new Set());
      pemicu.get(id)!.add(p.aktivitas);
    }
  }

  // Peringkat prioritas: indeks terkecil dari aktivitas pemicu; tanpa prioritas = terakhir.
  const peringkat = (id: string): number => {
    const idx = [...pemicu.get(id)!].map((a) => masukan.prioritas.indexOf(a)).filter((i) => i >= 0);
    return idx.length ? Math.min(...idx) : Infinity;
  };

  const urutan = [...pemicu.keys()]
    .map((id, i) => ({ id, i, r: peringkat(id) }))
    .sort((a, b) => a.r - b.r || a.i - b.i);

  const daftar: KartuRencana[] = urutan.map(({ id, r }) => {
    const k = kartuPerId.get(id)!;
    const tingkat: TingkatRencana[] = TINGKAT.flatMap((t) => {
      const s = k.solusi?.[t];
      if (!s) return [];
      const disembunyi = sewa && s.sifat === "permanen";
      const rentang = bacaKisaranRp(s.biaya.kisaran_rp);
      return [
        {
          tingkat: t,
          sifat: s.sifat,
          tampil: !disembunyi,
          ditandaiPermanen: belumJelas && s.sifat === "permanen",
          disembunyikanHunian: disembunyi,
          ditonjolkan: sewa && t === "alat_tanpa_bongkar",
          diAtasBudget: rentang !== null && maksBudget !== null && rentang.min > maksBudget,
        },
      ];
    });
    return { id, prioritas: r !== Infinity, isiMenyusul: !!k.isi_menyusul, tingkat };
  });

  const tingkatAwal = (k: KartuRencana) => k.tingkat.find((t) => t.tampil);
  const layak = (k: KartuRencana) => {
    const t = tingkatAwal(k);
    return !k.isiMenyusul && !!t && !t.ditandaiPermanen;
  };
  const mulaiDariSini = daftar.filter(layak).slice(0, config.maksMulaiDariSini);

  let satuHalHariIni: SatuHal | null = null;
  if (mulaiDariSini.length) {
    const pertama = mulaiDariSini[0];
    const t = tingkatAwal(pertama)!;
    const langkah = kartuPerId.get(pertama.id)?.solusi?.[t.tingkat]?.langkah[0];
    if (langkah) satuHalHariIni = { kartuId: pertama.id, tingkat: t.tingkat, langkah };
  }

  // Total: tingkat awal tiap kartu di daftar; hanya "diketahui" bila semuanya terbaca.
  let total: Rencana["total"] = { diketahui: false };
  if (daftar.length) {
    const rentang = daftar.map((k) => {
      const t = tingkatAwal(k);
      return t ? bacaKisaranRp(kartuPerId.get(k.id)?.solusi?.[t.tingkat]?.biaya.kisaran_rp) : null;
    });
    if (rentang.every((r): r is Rentang => r !== null)) {
      total = {
        diketahui: true,
        minRp: rentang.reduce((a, r) => a + r.min, 0),
        maksRp: rentang.reduce((a, r) => a + r.max, 0),
      };
    }
  }

  const pendamping = kartu.find(adalahPendamping)?.id ?? null;

  return {
    satuHalHariIni,
    mulaiDariSini,
    daftar,
    pendamping,
    urutanTampil: [...daftar.map((k) => k.id), ...(pendamping ? [pendamping] : [])],
    tampilkanCheckin: true,
    kosong: daftar.length === 0,
    kebutuhanJangkaPanjangBelumJelas: belumJelas,
    total,
  };
}
