import type { JenisAksi } from "./aksi";
import { aksiTersedia } from "./aksi";
import { AKTIVITAS, JENIS_BANTUAN, TINGKAT, type Aktivitas, type Tingkat } from "./konstanta";
import type { Kartu } from "./schema";

export type Filter = "semua" | "alat" | "ahli";
export type KunciKelompok = Aktivitas | "caregiver";

export interface AksiKartu {
  jenis: JenisAksi;
  /** Tingkat yang dipakai aksi; kosong untuk "ahli" (aksi tingkat kartu). */
  tingkat?: Tingkat;
}

export const adalahPendamping = (k: Kartu): boolean => k.tag.peran?.includes("caregiver") ?? false;

/**
 * Aksi yang bisa langsung dipakai dari sebuah kartu. Tiap aksi memakai tingkat paling ringan
 * yang mendukungnya, dari tingkat yang memang tampil (mis. renovasi tersembunyi di kontrakan).
 */
export function aksiKartu(kartu: Kartu, tingkatTampil: readonly Tingkat[]): AksiKartu[] {
  if (kartu.isi_menyusul || !kartu.solusi) return [];
  const urut = TINGKAT.filter((t) => tingkatTampil.includes(t));
  const hasil: AksiKartu[] = [];
  for (const jenis of ["sendiri", "beli", "tukang"] as const) {
    const tingkat = urut.find((t) => aksiTersedia(kartu, t).includes(jenis));
    if (tingkat) hasil.push({ jenis, tingkat });
  }
  if (kartu.bantuan && kartu.bantuan.length > 0) hasil.push({ jenis: "ahli" });
  return hasil;
}

const jenisFilter: Record<Exclude<Filter, "semua">, JenisAksi> = { alat: "beli", ahli: "ahli" };

/**
 * Aksi langsung yang ditampilkan di daftar. Tanpa filter tidak ada (pengguna belum menyatakan niat;
 * langkah dan bantuan ada di panduan). Dengan filter, hanya satu aksi yang sesuai dengan filter itu.
 */
export function aksiUntukFilter(aksi: readonly AksiKartu[], filter: Filter): AksiKartu[] {
  if (filter === "semua") return [];
  return aksi.filter((a) => a.jenis === jenisFilter[filter]);
}

/** "semua" menampilkan semua kartu (termasuk kerangka); filter lain hanya kartu yang punya aksi itu. */
export function cocokFilter(kartu: Kartu, tingkatTampil: readonly Tingkat[], filter: Filter): boolean {
  if (filter === "semua") return true;
  return aksiKartu(kartu, tingkatTampil).some((a) => a.jenis === jenisFilter[filter]);
}

/** Kelompok sebuah kartu: aktivitas pertama di tag-nya, atau "caregiver" untuk kartu pendamping. */
export function kunciKelompok(k: Kartu, urutanAktivitas: readonly Aktivitas[] = AKTIVITAS): KunciKelompok {
  return adalahPendamping(k) ? "caregiver" : (urutanAktivitas.find((a) => k.tag.aktivitas.includes(a)) ?? "umum");
}

/**
 * Mengelompokkan kartu per aktivitas (urutan aktivitas dari asesmen), kartu pendamping di akhir.
 * Dalam satu kelompok, kartu yang sudah berisi tampil sebelum kerangka, lalu urut id.
 * Urutan tidak pernah dipengaruhi tautan atau afiliasi.
 */
export function kelompokkan(kartu: Kartu[], urutanAktivitas: readonly Aktivitas[] = AKTIVITAS): { kunci: KunciKelompok; kartu: Kartu[] }[] {
  const kunciDari = (k: Kartu) => kunciKelompok(k, urutanAktivitas);
  const urut = [...urutanAktivitas, "caregiver" as const];
  const banding = (a: Kartu, b: Kartu) => Number(!!a.isi_menyusul) - Number(!!b.isi_menyusul) || a.id.localeCompare(b.id);

  return urut
    .map((kunci) => ({ kunci, kartu: kartu.filter((k) => kunciDari(k) === kunci).sort(banding) }))
    .filter((g) => g.kartu.length > 0);
}

export interface AlatItem {
  nama: string;
  cek_kecocokan: string;
  spesifikasi: string;
  kisaran_harga: string | null;
  link: string | null;
  afiliasi: boolean;
  gambar: { url: string; alt: string } | null;
  /** Panduan tempat alat ini muncul, beserta tingkat yang memuatnya. */
  panduan: { id: string; judul: string; tingkat: Tingkat }[];
}

/**
 * Semua alat dari semua panduan, digabung menurut nama. Hanya tingkat yang tampil yang dipakai.
 * Urutan mengikuti urutan panduan yang diberikan; tautan atau afiliasi tidak memengaruhinya.
 */
export function kumpulkanAlat(kartu: readonly Kartu[], tingkatTampil: (k: Kartu) => readonly Tingkat[]): AlatItem[] {
  const peta = new Map<string, AlatItem>();
  for (const k of kartu) {
    if (k.isi_menyusul || !k.solusi) continue;
    for (const tingkat of TINGKAT.filter((t) => tingkatTampil(k).includes(t))) {
      for (const b of k.solusi[tingkat]?.barang ?? []) {
        const kunci = b.nama.trim().toLowerCase();
        const ada = peta.get(kunci);
        const rujukan = { id: k.id, judul: k.judul, tingkat };
        if (ada) {
          if (!ada.panduan.some((p) => p.id === k.id)) ada.panduan.push(rujukan);
        } else {
          peta.set(kunci, { ...b, panduan: [rujukan] });
        }
      }
    }
  }
  return [...peta.values()];
}

export interface AhliItem {
  jenis: (typeof JENIS_BANTUAN)[number];
  panduan: { id: string; judul: string; keterangan: string }[];
}

/** Jenis ahli dari semua panduan, termasuk tukang (pertama), urut sesuai JENIS_BANTUAN. */
export function kumpulkanAhli(kartu: readonly Kartu[]): AhliItem[] {
  return JENIS_BANTUAN.map((jenis) => ({
    jenis,
    panduan: kartu.flatMap((k) =>
      k.isi_menyusul
        ? []
        : (k.bantuan ?? []).filter((b) => b.jenis === jenis).map((b) => ({ id: k.id, judul: k.judul, keterangan: b.keterangan })),
    ),
  })).filter((a) => a.panduan.length > 0);
}

const rapikanTeks = (t: string) =>
  t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

// Kata penghubung dan kata tanya yang lazim diketik ("cara mengatasi lantai licin") tetapi tidak ada di judul panduan.
const KATA_ABAI = new Set([
  "cara",
  "mengatasi",
  "atasi",
  "mengatur",
  "memperbaiki",
  "bagaimana",
  "gimana",
  "apa",
  "kenapa",
  "yang",
  "di",
  "ke",
  "dari",
  "untuk",
  "agar",
  "supaya",
  "saat",
  "ketika",
  "dan",
  "atau",
  "dengan",
  "pada",
  "kalau",
  "jika",
  "bila",
  "tentang",
  "soal",
  "panduan",
  "solusi",
]);

/**
 * Semua kata isi yang diketik harus ada di judul atau situasi panduan (tanpa membedakan huruf besar/kecil).
 * Kata penghubung/kata tanya diabaikan. Kosong atau hanya kata abai = semua cocok.
 */
export function cocokCari(kartu: Kartu, kataKunci: string): boolean {
  const kata = rapikanTeks(kataKunci)
    .split(/\s+/)
    .filter((k) => k && !KATA_ABAI.has(k));
  if (kata.length === 0) return true;
  const jerami = rapikanTeks(`${kartu.judul} ${kartu.situasi}`);
  return kata.every((k) => jerami.includes(k));
}
