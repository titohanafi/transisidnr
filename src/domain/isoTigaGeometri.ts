// Geometri murni untuk scene Three.js tingkat-ruangan (Milestone 4, prototipe di belakang flag VITE_ISO_3D —
// lihat DECISIONS.md). Mengonversi posisi 2D yang sudah dipakai tampak-atas/isometrik SVG (`titikDinding` di
// `denahGeometri.ts`) ke koordinat 3D Three.js, supaya satu sumber posisi dipakai di ketiga tampilan (bukan
// turunan baru yang bisa diam-diam beda).
import { H, titikDinding, W } from "./denahGeometri";
import type { DindingDenah, LetakDenah } from "./pindai";

// Ruangan 200x300 (W x H, satuan dunia SVG) dikonversi ke ~4x6 unit Three.js — skala yang wajar berdampingan
// dengan model yang sudah dites di PratinjauIsoTiga (benda dinormalkan ke tinggi ~0.8 unit).
export const SKALA_TIGA = 0.02;

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
