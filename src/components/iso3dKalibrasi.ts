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
// menempel). Render isometrik 45° kecil TERLALU AMBIGU untuk dipakai sebagai bukti arah.
//
// kloset & wastafel (Math.PI, bukan 0): user menandai SALAH di `KalibrasiRotasiDev.tsx` untuk dinding kiri+kanan —
// kedua model ternyata menghadap ke dinding, bukan ke ruangan, dengan asumsi dasar "+Z" lama. Pola yang SAMA
// PERSIS dengan area_mandi sebelumnya: dibalik 180°. Dicek ulang visual di dinding kiri DAN kanan (kloset+wastafel)
// setelah perbaikan — mangkuk/cekungan menghadap kamera di keduanya.
//
// area_mandi (Math.PI/2, BUKAN Math.PI seperti perkiraan pertama): user juga menandai SALAH shower di dinding
// kanan (arah masih salah) dan dinding depan/belakang (menghadap samping, bukan ke pengguna) meski sebelumnya
// Math.PI dikira benar. Dicek ulang dari NOL pakai AxesHelper + uji rotasi 0°/90°/180°/270° satu per satu di
// dinding "belakang" (dinding net Y=0, jadi rotasi lokal = rotasi dunia, paling gampang dibaca) — HANYA 90°
// (bukan 180°) yang membuat lengan foreshortened (menempel tegak lurus ke dinding, bukan menyamping). Dicek ulang
// visual di dinding kiri DAN kanan setelah perbaikan: kepala shower bulat jelas menghadap kamera di keduanya.
// Dinding depan/belakang BELUM bisa diverifikasi ulang lewat alat ini (bug rendering terpisah di
// KalibrasiRotasiDev.tsx membuat sel itu kosong, lihat catatan TODO di file itu) — tapi secara matematis rotasi-Y
// murni berlaku sama di dinding manapun (rotasi-Y tidak pernah mengubah komponen vertikal suatu arah; begitu juga
// komponen horizontal relatif terhadap dinding yang dihadapi, karena rotasi dasar `rotasiMenghadapDalam` per
// dinding sudah dirancang konsisten) — jadi 90° yang terbukti benar di kiri+kanan cukup kuat untuk digeneralisasi
// ke depan+belakang, TAPI tetap tercatat sebagai "belum dicek langsung" sampai bug alat itu diperbaiki.
//
// pintu (tetap 0): pengguna belum menandai salah untuk rotasi dasarnya — tapi mencatat masalah LAIN yang lebih
// dalam (lihat DECISIONS.md): posisi gagang/arah bukaan pintu seharusnya tergantung dekat sudut dinding mana
// (2 kemungkinan per dinding, bukan satu rotasi tetap) — belum diimplementasikan, bukan sekadar nilai kalibrasi.
export const ROTASI_KALIBRASI: Record<ObjekDenah, number> = {
  pintu: 0,
  kloset: Math.PI,
  wastafel: Math.PI,
  area_mandi: Math.PI / 2,
};

// Kemiringan TAMBAHAN (radian, sumbu-X LOKAL model, diterapkan ke `model` BUKAN `pembungkus`) khusus area_mandi:
// rotasi Y pembungkus (ROTASI_KALIBRASI) cuma memutar benda MENDATAR (menentukan dinding mana yang dihadapi),
// tidak bisa membuat lingkaran kepala shower MENUNDUK ke lantai/area mandi — itu perlu kemiringan di sumbu lain.
export const KEMIRINGAN_AREA_MANDI = -0.55;

// Koreksi ROLL (radian, sumbu-Z LOKAL model) — TANPA ini, kemiringan sumbu-X di atas membuat lingkaran kepala
// shower terlihat miring diagonal ("jam 4", kata user) alih-alih lurus menunduk ("jam 6"), karena model aslinya
// tidak simetris persis terhadap sumbu-X lokal (lengan membengkok, bukan lurus satu sumbu) — tilt sumbu-tunggal
// saja selalu menyisakan putaran (roll) residual. Ditemukan & nilainya dicari lewat cek visual langsung (sel
// shower dinding kanan di KalibrasiRotasiDev.tsx, dibesarkan sampai lingkaran kepala shower kebaca jelas) —
// 0.3 rad membuat lingkaran kepala shower jadi BULAT SIMETRIS menghadap kamera, bukan oval diagonal.
export const KEMIRINGAN_AREA_MANDI_ROLL = 0.3;

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
  // Kemiringan (kalau ada) DITERAPKAN DULU, SEBELUM kotak pembatas untuk memusatkan titik jangkar dihitung —
  // sebelumnya terbalik (kotak dihitung dari model yang belum dimiringkan, baru kemiringan ditambahkan
  // sesudahnya), hasilnya titik jangkar tidak lagi cocok dengan bentuk benda yang SUDAH miring: kepala shower
  // jadi tampak melayang jauh dari titik tempelnya di dinding, bukan menggantung tepat di bawahnya (ditemukan
  // lewat sumbu bantu di KalibrasiRotasiDev.tsx — user melaporkan arahnya "seperti jam 4, bukan jam 6").
  if (id === "area_mandi") {
    model.rotation.x = KEMIRINGAN_AREA_MANDI;
    model.rotation.z = KEMIRINGAN_AREA_MANDI_ROLL;
  }
  const kotakSetelahSkala = new THREE.Box3().setFromObject(model);
  const pusat = new THREE.Vector3();
  kotakSetelahSkala.getCenter(pusat);
  // Pusatkan x/z benda ke titik jangkarnya sendiri (0,0,0) dulu, baru digeser ke posisi dunia — supaya titik
  // jangkar konsisten di tengah-bawah model, lepas dari titik tumpu aslinya di file GLB.
  model.position.set(-pusat.x, -kotakSetelahSkala.min.y, -pusat.z);

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
