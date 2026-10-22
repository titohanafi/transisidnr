// Gambar benda kamar mandi (kloset, wastafel, pintu) bergaya manual perakitan, dibangun dengan alat yang sama dengan
// gambar shower (`gambarShower.ts`): kerangka dinding, kotak, dan ekstrusi jejak lantai. Satuan gambar ilustratif,
// BUKAN ukuran produk, dan gambar tidak pernah memuat angka.
import {
  ekstrusi,
  footprintOval,
  footprintPutar,
  kerangkaPanel,
  keRuang,
  kotak,
  latarPanel,
  poligon,
  titik,
  type Kerangka,
  type Primitif,
  type SisiDinding,
  type Titik,
} from "./gambarShower";

export const JENIS_BENDA = ["kloset_duduk", "kloset_jongkok", "wastafel", "pintu"] as const;
export type JenisBenda = (typeof JENIS_BENDA)[number];

const oval = (k: Kerangka, a: number, n: number, ra: number, rn: number, u: number, segmen = 32): Titik[] =>
  footprintOval(a, n, ra, rn, segmen).map(([x, y]) => titik(k, x, y, u));

// Versi E (disetujui pemilik di papan Claude Design): mangkuk, kaki, dan cekungan digeser dari sumbu tangki supaya
// pusatnya tampak sejajar dengan pusat tangki di layar, dan satu garis menyambungkan dasar tangki ke badan mangkuk.
// Geseran ditetapkan di LAYAR (6 satuan ke arah sisi mangkuk dan 6 ke atas pada panel), lalu diubah ke koordinat lokal
// (a, n) menurut sumbu dinding dan kamera yang dipakai, supaya hasilnya sama di semua dinding dan sudut pandang. Pada
// panel dinding belakang hasilnya (-9,464; -2,536).
const GESER_LAYAR = 6;
// Panjang garis penyambung (satuan lokal) dari sudut bawah muka tangki menerus ke arah n sampai badan mangkuk.
const PANJANG_PENYAMBUNG = 14.56;

/** Sumbu lokal `a` dan `n` di layar (vektor per satu satuan lokal, sudah termasuk skala kerangka). */
function sumbuLayar(k: Kerangka): { a: Titik; n: Titik } {
  const o = titik(k, 0, 0, 0);
  const a = titik(k, 1, 0, 0);
  const n = titik(k, 0, 1, 0);
  return { a: [a[0] - o[0], a[1] - o[1]], n: [n[0] - o[0], n[1] - o[1]] };
}

/** Geseran lokal (a, n) yang menggeser mangkuk 6 satuan layar ke sisi n dan 6 ke atas, pada skala panel. */
function geseranMangkuk(k: Kerangka): { a: number; n: number } {
  const { a: A, n: N } = sumbuLayar(k);
  const skala = Math.hypot(A[0], A[1]);
  const sx = (N[0] >= 0 ? GESER_LAYAR : -GESER_LAYAR) * skala;
  const sy = -GESER_LAYAR * skala;
  const det = A[0] * N[1] - N[0] * A[1];
  return { a: (sx * N[1] - N[0] * sy) / det, n: (A[0] * sy - sx * A[1]) / det };
}

/** Sisi tangki (+1 atau -1 sepanjang `a`) yang menghadap kamera: di situ garis penyambung digambar. */
function sisiTerlihat(k: Kerangka): 1 | -1 {
  const lihat = k.lihat ?? { x: 1, y: 1 };
  const [x0, y0] = keRuang(k, 0, 0);
  const [x1, y1] = keRuang(k, 1, 0);
  return (x1 - x0) * lihat.x + (y1 - y0) * lihat.y >= 0 ? 1 : -1;
}

function klosetDuduk(k: Kerangka): Primitif[] {
  const { a, n } = geseranMangkuk(k);
  const sisi = sisiTerlihat(k);
  const pusatN = 31 + n;
  return [
    ...kotak(k, -18, 18, 0, 18, 38, 80, "netral"),
    ...kotak(k, -20, 20, -1, 19.5, 80, 85, "netral"),
    ...ekstrusi(k, footprintOval(0, 9.25, 3.5, 3.5, 12), 85, 88, "netral", true),
    ...ekstrusi(k, footprintOval(a, pusatN, 11, 17, 24), 0, 28, "netral", true),
    ...ekstrusi(k, footprintOval(a, pusatN, 18, 26, 32), 28, 46, "netral", true),
    poligon("rongga", oval(k, a, pusatN, 12, 19, 46), "netral"),
    {
      jenis: "garis",
      dari: titik(k, sisi * 18, 18, 38),
      ke: titik(k, sisi * 18, 18 + PANJANG_PENYAMBUNG, 38),
      gaya: "tegas",
      peran: "netral",
    },
  ];
}

function klosetJongkok(k: Kerangka): Primitif[] {
  return [...kotak(k, -18, 18, 0, 58, 0, 4, "netral"), poligon("rongga", oval(k, 0, 22, 8, 19, 4), "netral")];
}

/**
 * Keran bersih (versi C yang disetujui): alas gelap di bawah semua sisi supaya hanya tepi luar yang tebal, garis di
 * dalam objek tipis, dan sisi dibedakan dengan nada warna.
 */
function bersihkan(daftar: Primitif[]): Primitif[] {
  const polis = daftar.filter((p): p is Extract<Primitif, { jenis: "poligon" }> => p.jenis === "poligon");
  return [...polis.map((p) => ({ ...p, tepi: true })), ...polis.map((p) => ({ ...p, garisTipis: true }))];
}

// Meja berbentuk D: setengah belakang persegi (menempel dinding), setengah depan oval, tanpa patahan di sambungan.
const JEJAK_MEJA: [number, number][] = [
  [-24, 0],
  [24, 0],
  ...Array.from({ length: 17 }, (_, i): [number, number] => {
    const th = (i / 16) * Math.PI;
    return [24 * Math.cos(th), 18 + 18 * Math.sin(th)];
  }),
];

function wastafel(k: Kerangka): Primitif[] {
  return [
    ...ekstrusi(k, footprintOval(0, 10, 2.5, 2.5, 10), 40, 78, "netral", true),
    ...kotak(k, -2.5, 2.5, 4, 14, 36, 42, "netral"),
    ...kotak(k, -14, -10, 6, 28, 66, 78, "netral"),
    ...kotak(k, 10, 14, 6, 28, 66, 78, "netral"),
    ...ekstrusi(k, JEJAK_MEJA, 78, 86, "netral", true),
    poligon("rongga", oval(k, 0, 20, 16, 12, 86), "netral"),
    ...bersihkan([...kotak(k, -2, 2, 3, 7, 86, 97, "netral"), ...kotak(k, -1.5, 1.5, 5, 19, 96, 99, "netral")]),
  ];
}

/** Arah tegak lurus (a, n) yang menghadap kamera, supaya gagang pintu dipasang di sisi daun yang terlihat. */
function normalTerlihat(k: Kerangka, na: number, nn: number): [number, number] {
  const lihat = k.lihat ?? { x: 1, y: 1 };
  const [x0, y0] = keRuang(k, 0, 0);
  const [x1, y1] = keRuang(k, na, nn);
  return (x1 - x0) * lihat.x + (y1 - y0) * lihat.y >= 0 ? [na, nn] : [-na, -nn];
}

function pintu(k: Kerangka): Primitif[] {
  const sudut = (55 * Math.PI) / 180;
  const engsel: [number, number] = [-44, 4];
  const panjang = 88;
  const arah: [number, number] = [Math.cos(sudut), Math.sin(sudut)];
  const tengah: [number, number] = [engsel[0] + (arah[0] * panjang) / 2, engsel[1] + (arah[1] * panjang) / 2];
  const [na, nn] = normalTerlihat(k, -arah[1], arah[0]);
  const gagang: [number, number] = [engsel[0] + arah[0] * 78 + na * 3.5, engsel[1] + arah[1] * 78 + nn * 3.5];
  const lintasan: Titik[] = Array.from({ length: 13 }, (_, i) => {
    const p = (i / 12) * sudut;
    return titik(k, engsel[0] + Math.cos(p) * panjang, engsel[1] + Math.sin(p) * panjang, 0);
  });
  return [
    { jenis: "garisPoli", titik: lintasan, peran: "hantu" },
    ...kotak(k, -48, -44, 0, 8, 0, 232, "netral"),
    ...kotak(k, 44, 48, 0, 8, 0, 232, "netral"),
    ...kotak(k, -48, 48, 0, 8, 228, 236, "netral"),
    ...ekstrusi(k, footprintPutar(tengah[0], tengah[1], panjang / 2, 2, sudut), 0, 226, "netral"),
    ...ekstrusi(k, footprintPutar(gagang[0], gagang[1], 5, 1.5, sudut), 98, 102, "netral"),
  ];
}

/** Gambar satu benda pada dinding yang ditentukan `kerangka` (bawaan: dinding kanan panel). */
export function gambarBenda(jenis: JenisBenda, kerangka: Kerangka = kerangkaPanel("kanan")): Primitif[] {
  switch (jenis) {
    case "kloset_duduk":
      return klosetDuduk(kerangka);
    case "kloset_jongkok":
      return klosetJongkok(kerangka);
    case "wastafel":
      return wastafel(kerangka);
    case "pintu":
      return pintu(kerangka);
  }
}

/** Gambar lengkap untuk panel: latar polos + benda pada dinding kanan (belakang) atau kiri. */
export function susunBenda(jenis: JenisBenda, sisi: SisiDinding, opsi: { latar?: boolean } = {}): Primitif[] {
  const k = kerangkaPanel(sisi);
  return [...(opsi.latar === false ? [] : latarPanel(k)), ...gambarBenda(jenis, k)];
}

function titikPrimitif(p: Primitif): Titik[] {
  switch (p.jenis) {
    case "poligon":
    case "jalur":
    case "garisPoli":
      return p.titik;
    case "garis":
      return [p.dari, p.ke];
    case "elips":
      return [
        [p.cx - p.rx, p.cy - p.ry],
        [p.cx + p.rx, p.cy + p.ry],
      ];
    case "badan":
      return [
        [p.cx - p.rx, p.yAtas - p.ry],
        [p.cx + p.rx, p.yBawah + p.ry],
      ];
    case "cakram":
      return [
        [p.cx - p.r * 40, p.cy - p.r * 40],
        [p.cx + p.r * 40, p.cy + p.r * 40],
      ];
    case "baut":
      return [[p.cx, p.cy]];
    case "tanda":
      return [[p.x, p.y]];
  }
}

/**
 * Bingkai (viewBox) yang pas dengan satu benda, dengan rasio yang sama dengan kanvas panel: dipakai untuk menampilkan
 * benda dari dekat. Latar dinding dan lantai tetap digambar penuh dan terpotong bingkai.
 */
export function bingkaiBenda(jenis: JenisBenda, sisi: SisiDinding, margin = 0.35): [number, number, number, number] {
  const pts = gambarBenda(jenis, kerangkaPanel(sisi)).flatMap(titikPrimitif);
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const rasio = 380 / 500;
  let w = (x1 - x0) * (1 + margin * 2);
  let h = (y1 - y0) * (1 + margin * 2);
  if (w / h > rasio) h = w / rasio;
  else w = h * rasio;
  return [(x0 + x1) / 2 - w / 2, (y0 + y1) / 2 - h / 2, w, h];
}
