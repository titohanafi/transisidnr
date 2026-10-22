// Gambar shower isometrik bergaya manual perakitan: fungsi murni yang menghasilkan daftar bentuk (primitif) dari
// varian, mode, dan ukuran. Komponen `GambarShower.tsx` hanya merender daftar ini.
//
// Satuan: "satuan gambar" di kanvas 380x500. Hanya tinggi zona jangkauan yang berasal dari tabel ukuran
// (`content/ukuran-aksesibel.json`, diubah ke satuan gambar lewat SKALA). Bentuk benda (kait, gagang, kepala shower,
// ember) adalah ilustrasi, BUKAN ukuran produk. Gambar tidak pernah menampilkan angka.
import type { VarianShower } from "./pindai";
import { nilaiAcuan } from "./ukuranAksesibel";

export type Titik = readonly [number, number];
export type ModeGambar = "kondisi" | "hack" | "permanen";
export type SisiDinding = "kanan" | "kiri";
export type Peran = "netral" | "aksen" | "hantu";
export type Muka = "atas" | "kanan" | "kiri";

export type Primitif =
  | { jenis: "poligon"; muka: Muka | "latar" | "zona" | "pita"; titik: Titik[]; peran: Peran }
  | { jenis: "elips"; cx: number; cy: number; rx: number; ry: number; tingkat: "atas" | "rongga" | "tutup"; peran: Peran }
  | { jenis: "badan"; cx: number; yAtas: number; yBawah: number; rx: number; ry: number; muka: "kanan" | "kiri"; peran: Peran }
  | { jenis: "cakram"; cx: number; cy: number; r: number; arah: 1 | -1; tingkat: "belakang" | "depan"; peran: Peran }
  | { jenis: "garis"; dari: Titik; ke: Titik; gaya: "tegas" | "putus" | "air" | "silang" | "panah"; peran: Peran }
  | { jenis: "jalur"; titik: Titik[]; gaya: "selang" | "gagang" | "lengkung"; peran: Peran }
  | { jenis: "baut"; cx: number; cy: number; peran: Peran }
  | { jenis: "tanda"; x: number; y: number; teks: string };

export const LEBAR_KANVAS = 380;
export const TINGGI_KANVAS = 500;
/** Satuan gambar per sentimeter, dipakai khusus untuk angka dari tabel ukuran. */
export const SKALA = 1.2;

const K = Math.sqrt(3) / 2;
const PUSAT_X = LEBAR_KANVAS / 2;
const PUSAT_Y = 400;

// Dinding kanan: sumbu `a` sepanjang dinding (turun ke kanan), `n` menjauh dari dinding ke dalam ruangan (turun ke
// kiri), `u` tinggi. Dinding kiri dibuat dengan mencerminkan hasilnya (lihat `cerminkan`).
export const titik = (a: number, n: number, u: number): Titik => [PUSAT_X + K * (a - n), PUSAT_Y + 0.5 * (a + n) - u];

export interface UkuranShower {
  /** Batas bawah zona jangkauan dari lantai, satuan gambar. */
  zonaBawah: number;
  /** Batas atas zona jangkauan dari lantai, satuan gambar. */
  zonaAtas: number;
}

/** Zona jangkauan dari tabel: batas atas kran/holder dan batas bawah rentang jangkauan (PerMen diutamakan). */
export function ukuranShower(): UkuranShower {
  const atas = nilaiAcuan("pancuran-tinggi-kran", "maks_cm");
  const bawah = nilaiAcuan("jangkauan-zona-perlengkapan", "min_cm");
  if (!atas || !bawah) throw new Error("tabel ukuran aksesibel tidak lengkap untuk gambar shower");
  return { zonaBawah: bawah.cm * SKALA, zonaAtas: atas.cm * SKALA };
}

const poligon = (muka: Muka | "latar" | "zona" | "pita", pts: Titik[], peran: Peran): Primitif => ({
  jenis: "poligon",
  muka,
  titik: pts,
  peran,
});

function kotak(a0: number, a1: number, n0: number, n1: number, u0: number, u1: number, peran: Peran): Primitif[] {
  return [
    poligon("atas", [titik(a0, n0, u1), titik(a1, n0, u1), titik(a1, n1, u1), titik(a0, n1, u1)], peran),
    poligon("kanan", [titik(a1, n0, u1), titik(a1, n1, u1), titik(a1, n1, u0), titik(a1, n0, u0)], peran),
    poligon("kiri", [titik(a0, n1, u1), titik(a1, n1, u1), titik(a1, n1, u0), titik(a0, n1, u0)], peran),
  ];
}

/** Sudut parameter (radian) tempat tepi elips cakram sejajar arah tebal `d`; dipakai untuk garis siluet silinder. */
export function sudutSinggung(arah: 1 | -1, d: Titik): number {
  const e1: Titik = [arah * K, 0.5];
  const e2: Titik = [0, -1];
  return Math.atan2(e2[0] * d[1] - e2[1] * d[0], e1[0] * d[1] - e1[1] * d[0]);
}

const pada = (c: Titik, r: number, arah: 1 | -1, theta: number): Titik => [
  c[0] + r * Math.cos(theta) * arah * K,
  c[1] + r * (Math.cos(theta) * 0.5 - Math.sin(theta)),
];

/** Silinder yang sumbunya menembus bidang `a`-`u` (kepala hand shower): cakram belakang, pita, siluet, cakram depan. */
function silinderCakram(belakang: Titik, d: Titik, r: number, peran: Peran): Primitif[] {
  const depan: Titik = [belakang[0] + d[0], belakang[1] + d[1]];
  const th = sudutSinggung(1, d);
  const b1 = pada(belakang, r, 1, th);
  const b2 = pada(belakang, r, 1, th + Math.PI);
  const d1 = pada(depan, r, 1, th);
  const d2 = pada(depan, r, 1, th + Math.PI);
  return [
    { jenis: "cakram", cx: belakang[0], cy: belakang[1], r, arah: 1, tingkat: "belakang", peran },
    poligon("pita", [b1, d1, d2, b2], peran),
    { jenis: "garis", dari: b1, ke: d1, gaya: "tegas", peran },
    { jenis: "garis", dari: b2, ke: d2, gaya: "tegas", peran },
    { jenis: "cakram", cx: depan[0], cy: depan[1], r, arah: 1, tingkat: "depan", peran },
  ];
}

/** Silinder berdiri di lantai atau di benda (ember, gayung, kepala shower tetap). `yAtas` = pusat elips tutup. */
function silinderTegak(
  cx: number,
  yAtas: number,
  r: number,
  tinggi: number,
  muka: "kanan" | "kiri",
  terbuka: boolean,
  peran: Peran,
): Primitif[] {
  const rx = r * Math.sqrt(1.5);
  const ry = r * Math.SQRT1_2;
  return [
    { jenis: "badan", cx, yAtas, yBawah: yAtas + tinggi, rx, ry, muka, peran },
    { jenis: "elips", cx, cy: yAtas, rx, ry, tingkat: "atas", peran },
    terbuka
      ? { jenis: "elips", cx, cy: yAtas + 1, rx: rx * 0.82, ry: ry * 0.8, tingkat: "rongga", peran }
      : { jenis: "elips", cx, cy: yAtas, rx: rx * 0.48, ry: ry * 0.48, tingkat: "tutup", peran },
  ];
}

function selang(mulai: Titik, akhir: Titik, pendek: boolean, peran: Peran): Primitif {
  const [sx, sy] = mulai;
  const [ex, ey] = akhir;
  const pts: Titik[] = pendek
    ? (() => {
        const l: Titik = [ex + 24.7, ey + 27];
        return [mulai, [sx + 43.6, sy + 10.5], [l[0] + 30, l[1] + 5], l, [l[0] - 16, l[1] - 3], [ex + 3, ey + 12], akhir];
      })()
    : (() => {
        const l: Titik = [ex + 31, ey + 10];
        return [mulai, [sx + 56, sy + 8], [l[0] + 24, l[1] - 30], l, [l[0] - 10, l[1] + 12], [ex + 7, ey + 10], akhir];
      })();
  return { jenis: "jalur", titik: pts, gaya: "selang", peran };
}

/** Dinding dan lantai polos (putih, hanya garis), supaya gaya mengikuti manual perakitan. */
export function latarPanel(): Primitif[] {
  return [
    poligon("latar", [titik(-100, 0, 0), titik(100, 0, 0), titik(100, 80, 0), titik(-100, 80, 0)], "netral"),
    poligon("latar", [titik(-100, 0, 0), titik(100, 0, 0), titik(100, 0, 310), titik(-100, 0, 310)], "netral"),
  ];
}

function keran(mode: ModeGambar): Primitif[] {
  const tuas = mode === "permanen";
  return [
    ...kotak(-38, -22, 0, 6, 92, 110, "netral"),
    ...kotak(-34, -26, 0, 28, 96, 106, "netral"),
    ...kotak(-32, -28, 1, 5, 106, 122, tuas ? "aksen" : "netral"),
    ...(tuas ? kotak(-32, -28, 2, 40, 122, 128, "aksen") : kotak(-40, -20, 0, 8, 122, 128, "netral")),
  ];
}

/** Posisi kait hand shower: tinggi atasnya dan geseran sepanjang dinding. Kondisi = di luar zona; hack/permanen = di batas atas zona. */
export function posisiKait(mode: ModeGambar, ukuran: UkuranShower = ukuranShower()): { uAtas: number; aGeser: number } {
  return mode === "kondisi" ? { uAtas: ukuran.zonaAtas + 100, aGeser: 0 } : { uAtas: ukuran.zonaAtas, aGeser: 35 };
}

function handShower(mode: ModeGambar, ukuran: UkuranShower, anotasi: boolean): Primitif[] {
  const { uAtas, aGeser } = posisiKait(mode, ukuran);
  const lama = posisiKait("kondisi", ukuran);
  const peran: Peran = mode === "kondisi" ? "netral" : "aksen";
  const uBawahGagang = mode === "kondisi" ? uAtas - 57 : uAtas - 17;
  const stub = kotak(26, 34, 0, 10, 96, 106, "netral");
  const ujungSelang = titik(30, 10, 101);
  const mulaiSelang = titik(aGeser + 4, 20, uBawahGagang);
  const pusatBelakang = titik(aGeser, 14, uAtas + 25);
  const d: Titik = [-K * 10, 5];
  const hasil: Primitif[] = [];

  if (anotasi) {
    hasil.push(
      poligon(
        "zona",
        [
          titik(-100, 0, ukuran.zonaBawah),
          titik(100, 0, ukuran.zonaBawah),
          titik(100, 0, ukuran.zonaAtas),
          titik(-100, 0, ukuran.zonaAtas),
        ],
        "aksen",
      ),
    );
  }
  hasil.push(...keran(mode));
  if (mode === "hack") hasil.push(...kotak(-8, 8, 0, 12, lama.uAtas - 20, lama.uAtas, "hantu"));
  hasil.push(selang(mulaiSelang, ujungSelang, mode !== "kondisi", "netral"), ...stub);
  hasil.push(...kotak(aGeser - 8, aGeser + 8, 0, 12, uAtas - 20, uAtas, peran));
  if (mode === "permanen") {
    const baut = (u: number): Primitif => {
      const [cx, cy] = titik(aGeser - 3, 12, u);
      return { jenis: "baut", cx, cy, peran };
    };
    hasil.push(baut(uAtas - 6.5), baut(uAtas - 18.5));
  }
  hasil.push(...kotak(aGeser - 4, aGeser + 4, 12, 20, uBawahGagang, uAtas + 17, peran));
  hasil.push(...silinderCakram(pusatBelakang, d, 22, peran));

  if (anotasi && mode === "kondisi") {
    const yAtasZona =
      titik(-100, 0, ukuran.zonaAtas)[1] + ((240 - titik(-100, 0, 0)[0]) / (titik(100, 0, 0)[0] - titik(-100, 0, 0)[0])) * 100;
    hasil.push({ jenis: "garis", dari: [240, yAtasZona], ke: [240, 206], gaya: "putus", peran: "netral" });
    hasil.push({ jenis: "garis", dari: [229, 176], ke: [251, 198], gaya: "silang", peran: "netral" });
    hasil.push({ jenis: "garis", dari: [251, 176], ke: [229, 198], gaya: "silang", peran: "netral" });
  }
  if (anotasi && mode === "hack") {
    const yMulai = titik(0, 0, lama.uAtas)[1] + 36;
    const yAkhir = titik(aGeser, 0, uAtas)[1] - 17;
    hasil.push({ jenis: "garis", dari: [246, yMulai], ke: [246, yAkhir], gaya: "panah", peran: "netral" });
  }
  return hasil;
}

function showerTetap(ukuran: UkuranShower): Primitif[] {
  const uP = ukuran.zonaAtas + 130;
  const [cx, cyAtas] = titik(0, 50, uP - 11);
  return [
    ...keran("kondisi"),
    ...[-19, 0, 19].map((dx, i): Primitif => ({
      jenis: "garis",
      dari: [cx + dx, cyAtas + 36 + (i === 1 ? 5 : 0)],
      ke: [cx + dx, cyAtas + 74 + (i === 1 ? 5 : 0)],
      gaya: "air",
      peran: "netral",
    })),
    ...silinderTegak(cx, cyAtas, 24, 10, "kiri", false, "netral"),
    ...kotak(-8, 8, 0, 6, uP - 12, uP + 4, "netral"),
    ...kotak(-2.5, 2.5, 6, 50, uP - 6, uP, "netral"),
  ];
}

function emberGayung(): Primitif[] {
  const [ex, eyBawah] = titik(-30, 40, 0);
  const tinggiEmber = 55;
  const yAtasEmber = eyBawah - tinggiEmber;
  const [gx, gyBawah] = titik(10, 30, 0);
  const ujungKeran = titik(-30, 28, 96);
  return [
    ...keran("kondisi"),
    {
      jenis: "garis",
      dari: [ujungKeran[0] - 0.3, ujungKeran[1] + 9],
      ke: [ujungKeran[0] - 7.8, yAtasEmber - 10],
      gaya: "air",
      peran: "netral",
    },
    {
      jenis: "jalur",
      titik: [
        [ex - 25.4, yAtasEmber - 4],
        [ex - 31.4, yAtasEmber - 50],
        [ex + 30.6, yAtasEmber - 50],
        [ex + 25.6, yAtasEmber - 4],
      ],
      gaya: "lengkung",
      peran: "netral",
    },
    ...silinderTegak(ex, yAtasEmber, 22, tinggiEmber, "kanan", true, "netral"),
    {
      jenis: "jalur",
      titik: [
        [gx + 9.3, gyBawah - 14],
        [gx + 41.3, gyBawah - 28],
      ],
      gaya: "gagang",
      peran: "netral",
    },
    ...silinderTegak(gx, gyBawah - 14, 9, 14, "kanan", true, "netral"),
  ];
}

function tidakJelas(): Primitif[] {
  const [tx, ty] = titik(0, 30, 170);
  return [...kotak(-20, 20, 0, 30, 140, 200, "hantu"), { jenis: "tanda", x: tx, y: ty + 11, teks: "?" }];
}

/**
 * Gambar satu varian shower pada dinding kanan, urutan gambar dari belakang ke depan. `mode` hanya berpengaruh pada
 * hand shower (kondisi dari foto, hack tanpa bongkar, permanen/renovasi). `anotasi` menambah zona jangkauan, silang, dan panah.
 */
export function gambarShower(
  varian: VarianShower,
  mode: ModeGambar = "kondisi",
  opsi: { anotasi?: boolean; ukuran?: UkuranShower } = {},
): Primitif[] {
  const ukuran = opsi.ukuran ?? ukuranShower();
  switch (varian) {
    case "hand_shower_gantung":
      return handShower(mode, ukuran, opsi.anotasi ?? false);
    case "shower_tetap":
      return showerTetap(ukuran);
    case "ember_gayung":
      return emberGayung();
    case "tidak_jelas":
      return tidakJelas();
  }
}

/**
 * Langkah gambar yang ditampilkan untuk satu jenis shower. Tiga langkah (kondisi, hack, permanen) hanya untuk hand
 * shower yang ditandai perlu perhatian, karena hanya itu yang punya gambar perbaikan; varian lain satu gambar
 * kondisi; "tidak_jelas" tidak menampilkan gambar (pengguna diminta memilih jenisnya).
 */
export function langkahGambarShower(varian: VarianShower, perhatian: boolean): ModeGambar[] {
  if (varian === "tidak_jelas") return [];
  return varian === "hand_shower_gantung" && perhatian ? ["kondisi", "hack", "permanen"] : ["kondisi"];
}

/** Cermin kiri-kanan di sumbu tengah kanvas (dinding kiri): sisi terang/gelap tetap mengikuti arah, jadi label muka ditukar. */
export function cerminkan(daftar: Primitif[]): Primitif[] {
  const x = (v: number) => LEBAR_KANVAS - v;
  const p = (t: Titik): Titik => [x(t[0]), t[1]];
  const tukar = <T extends string>(m: T): T => (m === "kanan" ? ("kiri" as T) : m === "kiri" ? ("kanan" as T) : m);
  return daftar.map((s): Primitif => {
    switch (s.jenis) {
      case "poligon":
        return { ...s, muka: tukar(s.muka), titik: s.titik.map(p) };
      case "elips":
        return { ...s, cx: x(s.cx) };
      case "badan":
        return { ...s, cx: x(s.cx), muka: tukar(s.muka) };
      case "cakram":
        return { ...s, cx: x(s.cx), arah: s.arah === 1 ? -1 : 1 };
      case "garis":
        return { ...s, dari: p(s.dari), ke: p(s.ke) };
      case "jalur":
        return { ...s, titik: s.titik.map(p) };
      case "baut":
        return { ...s, cx: x(s.cx) };
      case "tanda":
        return { ...s, x: x(s.x) };
    }
  });
}

/** Gambar lengkap: latar polos + varian pada dinding yang dipilih. */
export function susunGambar(
  varian: VarianShower,
  mode: ModeGambar,
  sisi: SisiDinding,
  opsi: { anotasi?: boolean; latar?: boolean } = {},
): Primitif[] {
  const isi = [...(opsi.latar === false ? [] : latarPanel()), ...gambarShower(varian, mode, { anotasi: opsi.anotasi })];
  return sisi === "kiri" ? cerminkan(isi) : isi;
}
