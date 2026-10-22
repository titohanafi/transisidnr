// Konstanta + logika posisi/skala kalibrasi visual untuk scene Three.js Pindai (dipakai bersama oleh
// `PratinjauRuangIso3D.tsx` dan alat bantu dev `KalibrasiRotasiDev.tsx`) — dipisah ke sini supaya KEDUANYA
// memakai angka DAN logika yang SAMA PERSIS, tidak ada risiko dua salinan diam-diam beda setelah salah satu
// diubah (lihat DECISIONS.md).
import * as THREE from "three";
import { posisiTiga, posisiTigaMenempel } from "../domain/isoTigaGeometri";
import type { LetakDenah, ObjekDenah } from "../domain/pindai";

export const MODEL_SRC: Record<ObjekDenah, string> = {
  pintu: "/model/pintu/quaternius-pintu.glb",
  kloset: "/model/toilet-quaternius/quaternius-toilet.glb",
  wastafel: "/model/wastafel/quaternius-wastafel.glb",
  area_mandi: "/model/shower/poly-google-shower-head.glb",
};

// Tinggi dinding DIHITUNG DULU (bukan belakangan) supaya tinggi tiap benda bisa ditentukan sebagai PECAHAN
// darinya — sebelumnya (Milestone 4) tinggi benda dipilih sembarangan tanpa acuan ke ukuran lantai, hasilnya
// lantai 4x6 vs pintu tinggi cuma 1.0 kelihatan seperti lapangan kosong, dilaporkan user "kamar mandi terasa
// luas banget, objek terlalu kecil, shower sampai tidak terlihat". Sekarang semua tinggi benda dihitung relatif
// terhadap TINGGI_DINDING (bukan angka lepas), supaya proporsinya konsisten lepas dari skala lantai berubah.
export const TINGGI_DINDING = 2.6;
export const TEBAL_DINDING = 0.03;

// Tinggi target tiap benda setelah dinormalkan (satuan Three.js, sama skala dengan lantai — lihat
// `LANTAI_LEBAR`/`LANTAI_DALAM` di isoTigaGeometri.ts), masing-masing sebagai PECAHAN dari TINGGI_DINDING —
// BEDA dari PratinjauIsoTiga.tsx (yang menyamakan semua benda ke 0.8 supaya adil dibandingkan satu-satu) karena
// di sini benda-benda berdiri BERSAMA dalam satu ruangan, jadi proporsi relatif antar benda DAN terhadap
// ruangan penting. Angka-angka ini perkiraan kasar (bukan ukuran nyata — dilarang mengarang ukuran kamar mandi
// pengguna, lihat CLAUDE.md), cuma supaya siluetnya masuk akal berdampingan dan terhadap ruangan.
//
// Rasio kloset sebelumnya (0.2) dicek ulang: dicocokkan ke pecahan tinggi pintu (acuan tinggi manusia yang jelas)
// bukan ditebak langsung dari tinggi dinding — kloset sungguhan (sampai tangki) biasanya ~35-40% tinggi pintu
// standar, bukan 20%. Setelah dicek, benda terlihat jelas tapi kloset & area_mandi masih kalah mencolok —
// dilaporkan user via screenshot ("kloset terlalu kecil, overall objeknya semua masih terlihat kecil"). Dinaikkan
// lagi sedikit di atas rasio dunia nyata murni untuk area_mandi (0.22), TAPI user lalu melapor itu jadi kebesaran
// dibanding benda lain & shower sungguhan — diturunkan lagi ke 0.15, lebih dekat ke ukuran kepala shower asli
// (fixture-nya sendiri, tanpa lengan panjang, biasanya ~12-15% tinggi dinding), bukan dibesar-besarkan lagi.
export const TINGGI_TARGET: Record<ObjekDenah, number> = {
  pintu: TINGGI_DINDING * 0.85, // nyaris setinggi dinding, sisakan sedikit ambang di atas
  wastafel: TINGGI_DINDING * 0.4,
  kloset: TINGGI_DINDING * 0.38,
  area_mandi: TINGGI_DINDING * 0.15,
};

// Dasar vertikal (y) tempat benda "berdiri" — kebanyakan di lantai (y=0), KECUALI kepala shower yang menempel
// tinggi di dinding (dekat atas TINGGI_DINDING, bukan angka lepas seperti Milestone 4 — sekarang ada dinding
// sungguhan sebagai acuan tingginya).
export const DASAR_Y: Record<ObjekDenah, number> = {
  pintu: 0,
  kloset: 0,
  wastafel: 0,
  // Diturunkan dari 0.78 ke 0.65 supaya ujung atas kepala shower (yang sekarang lebih tinggi, lihat TINGGI_TARGET)
  // tidak mepet/terpotong di puncak dinding.
  area_mandi: TINGGI_DINDING * 0.65,
};

// Rotasi tambahan PER JENIS BENDA (radian, ditambahkan ke rotasi dasar dari `posisiTiga`) — model GLB diekspor
// dengan arah "depan" bawaan yang tidak diketahui pasti (tidak ada konvensi universal), jadi mungkin perlu offset
// kalibrasi supaya benda benar-benar menghadap ke dalam ruangan, bukan ke dinding. Mulai dari 0 (asumsikan model
// sudah menghadap +Z) — DITENTUKAN/DIPERBAIKI lewat cek visual langsung di browser, lihat commit kalibrasi.
//
// PENTING — riwayat kepercayaan diri yang salah: nilai area_mandi sempat "diverifikasi" lewat baca render
// isometrik kecil di browser dan dianggap benar di 4 dinding, tapi user menunjukkan pembacaan itu KELIRU (shower
// di dinding kanan masih salah arah, kloset/wastafel di dinding kiri/kanan juga menghadap ke dinding bukan
// menempel). Render isometrik 45° kecil TERLALU AMBIGU untuk dipakai sebagai bukti arah — sekarang nilai di
// bawah ini harus dianggap BELUM TERVERIFIKASI sampai ditandai "Benar" oleh pengguna sendiri lewat
// `KalibrasiRotasiDev.tsx` (grid semua benda x semua dinding, kamera tegak lurus ke tiap dinding, bukan
// isometrik — lihat komponen itu untuk cara bacanya).
export const ROTASI_KALIBRASI: Record<ObjekDenah, number> = {
  pintu: 0,
  kloset: 0,
  wastafel: 0,
  area_mandi: Math.PI,
};

// Kemiringan TAMBAHAN (radian, sumbu-X LOKAL model, diterapkan ke `model` BUKAN `pembungkus`) khusus area_mandi:
// rotasi Y pembungkus (ROTASI_KALIBRASI) cuma memutar benda MENDATAR (menentukan dinding mana yang dihadapi),
// tidak bisa membuat lingkaran kepala shower MENUNDUK ke lantai/area mandi — itu perlu kemiringan di sumbu lain.
// BELUM TERVERIFIKASI pengguna juga — lihat catatan di ROTASI_KALIBRASI di atas.
export const KEMIRINGAN_AREA_MANDI = -0.55;

/** Benda yang SUNGGUHAN menempel/tertanam di dinding (dipakai `posisiTigaMenempel`, bukan `posisiTiga`) — beda
 *  dari benda berdiri bebas (kloset/wastafel) yang wajar punya jarak dari dinding. Lihat komentar di
 *  `isoTigaGeometri.ts`. */
export const OBJEK_MENEMPEL: ReadonlySet<ObjekDenah> = new Set<ObjekDenah>(["area_mandi", "pintu"]);

/**
 * Fungsi BERSAMA (dipakai `PratinjauRuangIso3D.tsx` DAN `KalibrasiRotasiDev.tsx`) yang mengubah model GLB mentah
 * jadi `THREE.Group` siap-taruh di scene: diskalakan ke `TINGGI_TARGET`, dipusatkan di dasar, dirotasi+diposisikan
 * sesuai `letak`. Meng-clone `modelAsli` dulu (bukan memakainya langsung) supaya AMAN dipanggil berkali-kali dari
 * satu model GLB yang di-cache/dipakai ulang (dev tool memuat tiap model SEKALI lalu meng-clone-nya ke 4 sel
 * dinding, bukan unduh ulang 4x) — tanpa clone, pemanggilan kedua akan menimpa transform pemanggilan pertama.
 */
export function bangunPembungkusObjek(id: ObjekDenah, letak: LetakDenah, modelAsli: THREE.Object3D): THREE.Group {
  const model = modelAsli.clone(true);
  const kotakAsli = new THREE.Box3().setFromObject(model);
  const ukuranAsli = new THREE.Vector3();
  kotakAsli.getSize(ukuranAsli);
  const skala = TINGGI_TARGET[id] / Math.max(ukuranAsli.y, 0.0001);
  model.scale.setScalar(skala);
  const kotakSetelahSkala = new THREE.Box3().setFromObject(model);
  const pusat = new THREE.Vector3();
  kotakSetelahSkala.getCenter(pusat);
  // Pusatkan x/z benda ke titik jangkarnya sendiri (0,0,0) dulu, baru digeser ke posisi dunia — supaya titik
  // jangkar konsisten di tengah-bawah model, lepas dari titik tumpu aslinya di file GLB.
  model.position.set(-pusat.x, -kotakSetelahSkala.min.y, -pusat.z);
  if (id === "area_mandi") model.rotation.x = KEMIRINGAN_AREA_MANDI;

  const menempel = OBJEK_MENEMPEL.has(id);
  const posisi = menempel ? posisiTigaMenempel(letak) : posisiTiga(letak);
  // Dorong sedikit ke dalam ruangan (menjauhi garis dinding) supaya mesh tidak z-fighting / menembus dinding —
  // kecil saja (separuh tebal dinding + sedikit), cukup supaya kelihatan menempel tanpa tenggelam di dinding.
  if (menempel) {
    const dorong = TEBAL_DINDING / 2 + 0.02;
    if (letak.dinding === "kiri") posisi.x += dorong;
    else if (letak.dinding === "kanan") posisi.x -= dorong;
    else if (letak.dinding === "depan") posisi.z -= dorong;
    else posisi.z += dorong;
  }

  const pembungkus = new THREE.Group();
  pembungkus.add(model);
  pembungkus.position.set(posisi.x, DASAR_Y[id], posisi.z);
  pembungkus.rotation.y = posisi.rotasiY + ROTASI_KALIBRASI[id];
  return pembungkus;
}
