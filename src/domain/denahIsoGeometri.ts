// Geometri khusus tampilan isometrik (dipakai `denahSvgIso` di `src/components/DenahKamarMandi.tsx`) yang
// angkanya SENGAJA ditala manual lewat tes langsung di browser — bukan diturunkan murni dari katalog ukuran
// (`objekUkuran.ts`), karena menyamakannya persis dengan katalog akan menghidupkan lagi masalah visual yang sudah
// diperbaiki (lihat komentar tiap konstanta). Diberi nama & dites di sini (lihat tests/denahIsoGeometri.test.ts)
// supaya perubahan ukuran benda di masa depan tidak diam-diam mematahkan efek ini tanpa ketahuan — sebelumnya
// cuma ketahuan lewat screenshot manual, sumber pola 20+ commit tambal-geometri.
import { H, TitikDatar, W } from "./denahGeometri";
import { UKURAN_KLOSET } from "./objekUkuran";

// Tebal dinding isometrik (dipakai sebagai kedalaman ekstrusi kotak dinding lewat `BentukIso`).
export const TEBAL_DINDING = 11;

export function footprintDindingBelakang(): TitikDatar[] {
  return [
    { x: 0, y: 0 },
    { x: W, y: 0 },
    { x: W, y: -TEBAL_DINDING },
    { x: 0, y: -TEBAL_DINDING },
  ];
}

export function footprintDindingKiri(): TitikDatar[] {
  return [
    { x: 0, y: 0 },
    { x: 0, y: H },
    { x: -TEBAL_DINDING, y: H },
    { x: -TEBAL_DINDING, y: 0 },
  ];
}

// Bayangan cermin footprintDindingKiri terhadap x=W — dipakai gantian dengan dinding kiri (tidak pernah keduanya
// sekaligus), sesuai sisi mana yang sedang "solid" (lihat `footprintDindingSamping`).
export function footprintDindingKanan(): TitikDatar[] {
  return [
    { x: W, y: 0 },
    { x: W, y: H },
    { x: W + TEBAL_DINDING, y: H },
    { x: W + TEBAL_DINDING, y: 0 },
  ];
}

/** Dinding samping mana yang digambar solid — satu-satunya hal yang berubah saat tombol putar ditekan (lihat
 *  komentar di `denahSvgIso`: posisi benda TIDAK PERNAH berubah, cuma pilihan dinding solid ini). */
export function footprintDindingSamping(sudut: "kiri" | "kanan"): TitikDatar[] {
  return sudut === "kanan" ? footprintDindingKanan() : footprintDindingKiri();
}

/** Tiang sudut tipis di pojok yang tidak ditempeli dinding solid — selalu di pojok BERLAWANAN dari dinding
 *  samping yang solid (dinding kanan solid -> tiang di pojok kiri, dan sebaliknya). */
export function footprintTiangSudut(sudut: "kiri" | "kanan"): TitikDatar[] {
  return sudut === "kanan"
    ? [
        { x: 0, y: H },
        { x: -TEBAL_DINDING, y: H },
        { x: -TEBAL_DINDING, y: H + TEBAL_DINDING },
        { x: 0, y: H + TEBAL_DINDING },
      ]
    : [
        { x: W, y: H },
        { x: W + TEBAL_DINDING, y: H },
        { x: W + TEBAL_DINDING, y: H + TEBAL_DINDING },
        { x: W, y: H + TEBAL_DINDING },
      ];
}

/** Footprint oval datar (poligon N-sisi mendekati elips) — dipakai untuk mangkuk kloset supaya ada kurva lewat
 *  `BentukIso`, bukan kotak persegi polos seperti sebelumnya (itu sumber kesan "abstrak, tidak berbentuk" yang
 *  dilaporkan user). Bentuk dasar oval-di-atas-kotak ini konvensi umum ilustrasi isometrik kloset, bukan niruan
 *  satu referensi spesifik — segmen 16 cukup halus untuk ukuran ikon ini tanpa elemen SVG berlebihan. */
export function footprintOval(x: number, y: number, rx: number, ry: number, segmen = 16): TitikDatar[] {
  return Array.from({ length: segmen }, (_, i) => {
    const a = (i / segmen) * Math.PI * 2;
    return { x: x + rx * Math.cos(a), y: y + ry * Math.sin(a) };
  });
}

export const KLOSET_TINGGI_MANGKUK = 26;
export const TANGKI_TINGGI = 36;

// "Pas bersentuhan" = jarak pusat-ke-pusat mangkuk-tangki kalau keduanya cuma bersentuhan tepat di satu sisi,
// tanpa tumpang tindih sama sekali (setengah-dalam mangkuk + setengah-tinggi tangki dari katalog). Angka ini
// sendiri BUKAN yang dipakai untuk menggambar (lihat TANGKI_PUSH_IN) — cuma pembanding untuk menjelaskan kenapa
// tuning di bawah lebih kecil dari ini.
export const TANGKI_SENTUH_PERSIS = UKURAN_KLOSET.mangkuk.ry + UKURAN_KLOSET.tangki.h / 2;

// Tangki kloset didorong ke arah dinding LEBIH DEKAT dari "pas bersentuhan" (TANGKI_SENTUH_PERSIS), DAN z-nya
// sengaja tumpang tindih sedikit dengan mangkuk (mulai di TANGKI_Z_MULAI, bukan tepat di KLOSET_TINGGI_MANGKUK) —
// dites langsung di browser: kalau cuma "pas bersentuhan" tanpa tumpang tindih sama sekali, dua kotak kelihatan
// seperti dua benda terpisah yang melayang berdekatan (ada celah semu akibat lebar garis), bukan satu kloset yang
// menyatu. Nilai final (-28, 14) dipertahankan PERSIS sama seperti sebelum refactor ini — jangan diubah tanpa
// pengecekan visual langsung di browser.
export const TANGKI_PUSH_IN = -28;
export const TANGKI_Z_MULAI = 14;
export const TANGKI_OVERLAP_Z = KLOSET_TINGGI_MANGKUK - TANGKI_Z_MULAI;

// Keran wastafel digeser ke arah dinding dari badan utamanya — jaraknya PERSIS jumlah "setengah lebar" kedua
// bentuk (konter + keran), supaya cuma bersentuhan di satu sisi (selisih nol), bukan tumpang tindih. Beda dari
// tuning kloset di atas: ini formula bersih (bukan hasil coba-coba visual), tapi sebelumnya angkanya ditulis
// sebagai literal lepas (`22`, `3`) — diberi nama di sini supaya jelas dari mana asalnya.
export const WASTAFEL_KONTER_SETENGAH_DALAM = 22;
export const WASTAFEL_KERAN_SETENGAH = 3;
export const WASTAFEL_KERAN_PUSH_IN = -(WASTAFEL_KONTER_SETENGAH_DALAM + WASTAFEL_KERAN_SETENGAH);
