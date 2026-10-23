// Urutan tab di layar hasil: perhatian dulu (paling actionable), lalu mendukung ("ramah"), lalu tidak jelas.
export const STATUS_ITEM = ["perhatian", "ramah", "tidak_jelas"] as const;
export type StatusItem = (typeof STATUS_ITEM)[number];
export type TingkatRamah = "belum_cukup" | "banyak" | "sebagian" | "cukup";

export interface Skor {
  tingkat: TingkatRamah;
  ramah: number;
  perhatian: number;
  tidakJelas: number;
  /** Jumlah hal yang terlihat jelas (ramah + perhatian). */
  jelas: number;
}

// Ambang ini heuristik awal (bukan angka klinis) dan perlu ditinjau ahli; lihat DECISIONS.md.
export const MIN_JELAS = 4;
export const AMBANG_CUKUP = 0.8;
export const AMBANG_SEBAGIAN = 0.5;

/** Fungsi murni: skor dihitung dari temuan per hal, bukan dari angka yang diberikan model. */
export function hitungSkor(temuan: Record<string, StatusItem>, idItem: string[]): Skor {
  let ramah = 0;
  let perhatian = 0;
  let tidakJelas = 0;
  for (const id of idItem) {
    const s = temuan[id] ?? "tidak_jelas";
    if (s === "ramah") ramah++;
    else if (s === "perhatian") perhatian++;
    else tidakJelas++;
  }
  const jelas = ramah + perhatian;
  let tingkat: TingkatRamah;
  if (jelas < MIN_JELAS) tingkat = "belum_cukup";
  else if (ramah / jelas >= AMBANG_CUKUP) tingkat = "cukup";
  else if (ramah / jelas >= AMBANG_SEBAGIAN) tingkat = "sebagian";
  else tingkat = "banyak";
  return { tingkat, ramah, perhatian, tidakJelas, jelas };
}

// Denah: tiap benda digambarkan sebagai (dinding yang ditempel) + (posisi di sepanjang dinding itu) — bukan dari
// grid kiri/tengah/kanan x depan/tengah/belakang seperti sebelumnya. Dinding diminta LANGSUNG dari AI (bukan
// ditebak dari zona), supaya tidak ambigu untuk posisi pojok: versi grid lama memaksa kode menebak "pojok kanan
// belakang" itu menempel dinding kanan atau dinding belakang, dan tebakan itu bisa beda untuk tiap benda walau
// sebenarnya salah satunya di dinding kanan dan satunya di dinding belakang (lihat DECISIONS.md).
export const DINDING_DENAH = ["kiri", "kanan", "depan", "belakang"] as const;
export type DindingDenah = (typeof DINDING_DENAH)[number];
export type Dinding = DindingDenah | "tidak_terlihat";
export const DINDING_OBJEK = [...DINDING_DENAH, "tidak_terlihat"] as const;

// Posisi di sepanjang dinding: untuk dinding kiri/kanan dipakai depan/tengah/belakang (seberapa dekat ke pintu);
// untuk dinding depan/belakang dipakai kiri/tengah/kanan (dari sudut pandang orang di pintu). "tengah" dipakai
// untuk keduanya; kata yang tidak relevan dengan dinding yang dipilih diperlakukan sebagai "tengah".
export const POSISI_DI_DINDING = ["kiri", "tengah", "kanan", "depan", "belakang"] as const;
export type PosisiDiDinding = (typeof POSISI_DI_DINDING)[number];

export interface PosisiObjek {
  dinding: Dinding;
  posisi: PosisiDiDinding;
}

/** Sama seperti `PosisiObjek`, tapi dindingnya dijamin bukan "tidak_terlihat" (dipakai untuk tata letak bawaan). */
export interface LetakDenah {
  dinding: DindingDenah;
  posisi: PosisiDiDinding;
}

export const OBJEK_DENAH = ["pintu", "kloset", "wastafel", "area_mandi"] as const;
export type ObjekDenah = (typeof OBJEK_DENAH)[number];

// Jenis shower yang dikenali dari foto. Daftar tertutup: tiap varian punya gambar sendiri (lihat gambarShower.ts),
// dan "tidak_jelas" dipakai bila jenisnya tidak terbaca supaya denah tidak menggambar benda yang tidak ada.
export const VARIAN_SHOWER = ["hand_shower_gantung", "shower_tetap", "ember_gayung", "tidak_jelas"] as const;
export type VarianShower = (typeof VARIAN_SHOWER)[number];

// Jenis kloset dan cara pintu membuka yang dikenali dari foto. Sama seperti varian shower: daftar tertutup, tiap nilai
// punya gambar sendiri (gambarBenda.ts), dan "tidak_jelas" menampilkan penanda netral, bukan tebakan.
export const JENIS_KLOSET = ["duduk", "jongkok", "tidak_jelas"] as const;
export type JenisKloset = (typeof JENIS_KLOSET)[number];
export const VARIAN_PINTU = ["ayun_ke_dalam", "ayun_ke_luar", "geser", "tidak_jelas"] as const;
export type VarianPintu = (typeof VARIAN_PINTU)[number];

// Pintu di dinding depan; wastafel dan kloset sama-sama di dinding belakang, berdampingan (kloset di sisi kanan,
// wastafel di sisi kirinya); area mandi di dinding kanan (dinding yang beda dari kloset, walau sama-sama "di
// pojok kanan belakang" kalau dilihat sebagai zona) pada kedalaman tengah, supaya tidak menumpuk dengan kloset.
// (Dulu sempat dipindah ke "kiri" karena tampilan isometrik cuma pernah menggambar 2 dinding tetap — tapi itu
// salah arah, posisinya jadi tidak sesuai foto asli. Perbaikan sebenarnya ada di DenahKamarMandi.tsx: tampilan
// isometrik sekarang MEMILIH SENDIRI sepasang dinding mana yang digambar solid berdasarkan data benda yang ada,
// jadi posisi bawaan di sini bisa kembali ke yang paling masuk akal menurut tata letak foto, bukan menurut
// dinding mana yang kebetulan digambar.)
/** Posisi bawaan dipakai bila AI tidak melihat objeknya (atau saat "nilai sendiri dari foto", tanpa posisi dari AI). */
export const POSISI_BAWAAN: Record<ObjekDenah, LetakDenah> = {
  pintu: { dinding: "depan", posisi: "kiri" },
  wastafel: { dinding: "belakang", posisi: "kiri" },
  kloset: { dinding: "belakang", posisi: "kanan" },
  area_mandi: { dinding: "kanan", posisi: "tengah" },
};

// Jarak "kiri"/"kanan" (atau "depan"/"belakang") ke tengah sengaja tidak dibuat mepet pojok: dua benda yang sama-sama
// di dinding yang sama biasanya tidak sejauh ujung-ke-ujung dinding (mis. wastafel dan kloset berdampingan, bukan
// di dua ujung ruangan).
const PERSEN_KIRI_KANAN: Record<PosisiDiDinding, number> = { kiri: 28, tengah: 50, kanan: 72, depan: 50, belakang: 50 };
// "depan" = dekat pintu/kamera, digambar di bawah denah; "belakang" = jauh dari pintu, di atas denah.
const PERSEN_DEPAN_BELAKANG: Record<PosisiDiDinding, number> = { depan: 72, tengah: 50, belakang: 28, kiri: 50, kanan: 50 };

/**
 * Fungsi murni: (dinding, posisi) -> persen (kiri, atas) untuk ditempatkan di kontainer relatif. Kata posisi yang
 * tidak relevan dengan dinding yang dipilih (mis. "kiri" untuk dinding "kiri" sendiri) diperlakukan sebagai "tengah"
 * lewat tabel di atas.
 */
export function posisiPersenDenah({ dinding, posisi }: { dinding: DindingDenah; posisi: PosisiDiDinding }): {
  kiri: number;
  atas: number;
} {
  if (dinding === "kiri") return { kiri: 18, atas: PERSEN_DEPAN_BELAKANG[posisi] };
  if (dinding === "kanan") return { kiri: 82, atas: PERSEN_DEPAN_BELAKANG[posisi] };
  if (dinding === "depan") return { kiri: PERSEN_KIRI_KANAN[posisi], atas: 80 };
  return { kiri: PERSEN_KIRI_KANAN[posisi], atas: 20 }; // belakang
}

const URUTAN_POSISI_SEPANJANG_DINDING: Record<DindingDenah, readonly PosisiDiDinding[]> = {
  kiri: ["belakang", "tengah", "depan"],
  kanan: ["belakang", "tengah", "depan"],
  depan: ["kanan", "tengah", "kiri"],
  belakang: ["kanan", "tengah", "kiri"],
};
// Urutan ini menentukan benda mana yang "menang" posisi bila AI kebetulan menjawab dinding DAN posisi yang persis
// sama untuk dua benda; pintu jarang bentrok (dindingnya biasanya unik), kloset dianggap paling tetap (satu titik
// jelas), area mandi paling fleksibel (sudah digambar sebagai zona memanjang, jadi sedikit bergeser sepanjang
// dinding tidak terlihat aneh).
const PRIORITAS_OBJEK: readonly ObjekDenah[] = ["pintu", "kloset", "wastafel", "area_mandi"];

/**
 * Fungsi murni: bila dua benda kebetulan dapat (dinding, posisi) yang PERSIS sama (akan tergambar numpuk), benda
 * dengan prioritas lebih rendah digeser satu langkah di sepanjang dinding yang SAMA, supaya denah tidak pernah
 * menumpuk sempurna apa pun jawaban AI-nya. Dinding tidak pernah diubah oleh fungsi ini (itu sudah pasti dari AI).
 */
export function selesaikanTabrakanDenah(objek: Record<ObjekDenah, PosisiObjek>): Record<ObjekDenah, PosisiObjek> {
  const dipakai = new Set<string>();
  const hasil = { ...objek };
  for (const id of PRIORITAS_OBJEK) {
    const { dinding } = hasil[id];
    let { posisi } = hasil[id];
    if (dinding === "tidak_terlihat") continue;
    let kunci = `${dinding}_${posisi}`;
    while (dipakai.has(kunci)) {
      const urutan = URUTAN_POSISI_SEPANJANG_DINDING[dinding];
      const i = urutan.indexOf(posisi);
      if (i >= urutan.length - 1) break; // sudah ujung dinding, tidak bisa digeser lagi
      posisi = urutan[i + 1];
      kunci = `${dinding}_${posisi}`;
    }
    hasil[id] = { dinding, posisi };
    dipakai.add(kunci);
  }
  return hasil;
}

// Urutan tampilan "Rincian per hal": sama dengan urutan tab status (lihat STATUS_ITEM) - perhatian dulu (paling
// actionable), lalu mendukung, lalu tidak jelas. Dipakai juga untuk penomoran supaya nomor di denah dan di daftar
// sama-sama berurut 1..n mengikuti urutan baca di layar, bukan urutan konten yang sudah tidak terlihat setelah
// dikelompokkan per status.
export const URUTAN_STATUS_HASIL: readonly StatusItem[] = ["perhatian", "ramah", "tidak_jelas"];

/**
 * Fungsi murni: nomor urut untuk tiap hal, mengikuti urutan tampil di "Rincian per hal" (dikelompokkan per status,
 * lihat `URUTAN_STATUS_HASIL`) — bukan urutan konten — supaya nomor yang terlihat di layar selalu berurut 1..n,
 * dan badge di denah (pakai fungsi yang sama) tetap cocok dengan nomor itu. Semua hal diberi nomor (termasuk
 * "lantai"/"ruang", yang ditandai di denah lewat badge di titik tertentu walau mewakili seluruh ruangan).
 */
export function nomorItemHasil(idItem: readonly string[], temuan: Record<string, StatusItem>): Record<string, number> {
  const terurut = [...idItem].sort((a, b) => {
    const pa = URUTAN_STATUS_HASIL.indexOf(temuan[a] ?? "tidak_jelas");
    const pb = URUTAN_STATUS_HASIL.indexOf(temuan[b] ?? "tidak_jelas");
    return pa - pb;
  });
  const hasil: Record<string, number> = {};
  terurut.forEach((id, i) => {
    hasil[id] = i + 1;
  });
  return hasil;
}
