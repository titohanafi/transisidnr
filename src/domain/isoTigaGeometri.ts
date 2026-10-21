// Geometri murni untuk scene Three.js tingkat-ruangan (Milestone 4, prototipe di belakang flag VITE_ISO_3D —
// lihat DECISIONS.md). Mengonversi posisi 2D yang sudah dipakai tampak-atas/isometrik SVG (`titikDinding` di
// `denahGeometri.ts`) ke koordinat 3D Three.js, supaya satu sumber posisi dipakai di ketiga tampilan (bukan
// turunan baru yang bisa diam-diam beda).
import { H, titikDinding, W } from "./denahGeometri";
import type { DindingDenah, LetakDenah } from "./pindai";

// Ruangan 200x300 (W x H, satuan dunia SVG) dikonversi ke satuan Three.js lewat SKALA_TIGA. Nilai sebelumnya
// (0.02 -> lantai 4x6) dipilih sembarangan, TIDAK direlasikan ke TINGGI_DINDING (2.6, lihat
// PratinjauRuangIso3D.tsx) — hasilnya lantai berbanding dinding jadi ~1.5x/~2.3x, user melapor "lantai terasa
// luas banget, masih ada area kosong setelah pintu" (dibandingkan ke foto referensi kamar mandi kecil). Diturunkan
// ke 0.012 (lantai jadi 2.4x3.6) supaya rasio lantai:tinggi-dinding (~0.9/~1.4) lebih dekat ke kamar mandi
// sungguhan, sambil tetap menyisakan ruang muat kursi roda (bukan sekecil kamar mandi non-aksesibel di foto
// referensi, yang secara desain untuk pengguna kursi roda terlalu sempit).
export const SKALA_TIGA = 0.012;

/** Rotasi sumbu-Y (radian) supaya benda "menghadap ke dalam ruangan" dari dinding tempat ia menempel — ini
 *  rotasi sumbu-tunggal sederhana karena modelnya objek 3D sungguhan, BEDA dari trik flip 2D yang dipakai kalau
 *  sumber datanya ikon SVG datar (lihat diskusi di DECISIONS.md). Nilai dasar di sini mengasumsikan model
 *  menghadap +Z secara bawaan — kemungkinan perlu offset kalibrasi per jenis benda (lihat `ROTASI_DASAR` di
 *  `PratinjauRuangIso3D.tsx`) kalau asumsi itu salah untuk model tertentu, ditentukan lewat cek visual. */
function rotasiMenghadapDalam(dinding: DindingDenah): number {
  switch (dinding) {
    case "belakang":
      return 0; // menghadap +Z (ke arah pintu/kamera)
    case "kanan":
      return Math.PI / 2; // menghadap -X (ke kiri, masuk ruangan)
    case "depan":
      return Math.PI; // menghadap -Z (ke arah dinding belakang)
    case "kiri":
      return -Math.PI / 2; // menghadap +X (ke kanan, masuk ruangan)
  }
}

export interface PosisiTiga {
  x: number;
  z: number;
  rotasiY: number;
}

/** Fungsi murni: posisi+rotasi 3D suatu benda dari `letak`-nya (dinding+posisi sepanjang dinding dari AI/mock) —
 *  dipusatkan di origin (0,0) supaya ruangan dan kamera gampang dihitung relatif terhadap tengah. */
export function posisiTiga(letak: LetakDenah): PosisiTiga {
  const titik = titikDinding(letak);
  return {
    x: (titik.x - W / 2) * SKALA_TIGA,
    z: (titik.y - H / 2) * SKALA_TIGA,
    rotasiY: rotasiMenghadapDalam(titik.dinding),
  };
}

/** Lebar/dalam lantai ruangan dalam satuan Three.js (dipakai untuk PlaneGeometry acuan). */
export const LANTAI_LEBAR = W * SKALA_TIGA;
export const LANTAI_DALAM = H * SKALA_TIGA;

/** Sama seperti `posisiTiga`, tapi koordinat tegak lurus dinding dipaksa RATA ke garis dinding SUNGGUHAN di
 *  satuan Three.js (±LANTAI_LEBAR/2 atau ±LANTAI_DALAM/2) — dipakai untuk benda yang SUNGGUHAN menempel/tertanam
 *  di dinding (kepala shower, daun pintu), beda dari benda berdiri bebas (kloset/wastafel) yang memang wajar
 *  punya jarak dari dinding.
 *
 *  SEBELUMNYA fungsi ini memakai `keDinding` (satuan SVG, ikut PAD=10 dari denahGeometri.ts) lalu dikonversi
 *  lewat SKALA_TIGA — itu salah: PAD dipilih untuk skala SVG yang lama (W=200), begitu SKALA_TIGA diperkecil
 *  (lihat komentar di atas) celah dari PAD itu jadi PROPORSIONAL LEBIH BESAR terhadap ruangan yang mengecil,
 *  hasilnya benda makin terlihat TIDAK menempel dinding padahal maksudnya sebaliknya. Sekarang koordinat tegak
 *  lurusnya dihitung LANGSUNG dari ukuran lantai 3D (tidak lewat satuan SVG sama sekali), jadi selalu rata ke
 *  dinding berapa pun SKALA_TIGA-nya. */
export function posisiTigaMenempel(letak: LetakDenah): PosisiTiga {
  const titik = titikDinding(letak);
  const x = (titik.x - W / 2) * SKALA_TIGA;
  const z = (titik.y - H / 2) * SKALA_TIGA;
  const rata =
    titik.dinding === "kiri"
      ? { x: -LANTAI_LEBAR / 2, z }
      : titik.dinding === "kanan"
        ? { x: LANTAI_LEBAR / 2, z }
        : titik.dinding === "depan"
          ? { x, z: LANTAI_DALAM / 2 }
          : { x, z: -LANTAI_DALAM / 2 };
  return { ...rata, rotasiY: rotasiMenghadapDalam(titik.dinding) };
}
