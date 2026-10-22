// Gambar shower isometrik bergaya manual perakitan: fungsi murni yang menghasilkan daftar bentuk (primitif) dari
// varian, mode, ukuran, dan "kerangka dinding" (dinding mana, di titik mana, diproyeksikan bagaimana). Komponen
// `GambarShower.tsx` merender daftar ini sebagai panel; denah isometrik (`DenahKamarMandi.tsx`) memakai daftar yang
// sama langsung di koordinat ruangan.
//
// Satuan: "satuan gambar". Hanya tinggi zona jangkauan yang berasal dari tabel ukuran
// (`content/ukuran-aksesibel.json`, diubah ke satuan gambar lewat SKALA). Bentuk benda (kait, gagang, kepala shower,
// ember) adalah ilustrasi, BUKAN ukuran produk. Gambar tidak pernah menampilkan angka.
import type { VarianShower } from "./pindai";
import { nilaiAcuan } from "./ukuranAksesibel";

export type Titik = readonly [number, number];
export type ModeGambar = "kondisi" | "hack" | "permanen";
export type SisiDinding = "kanan" | "kiri";
export type Dinding = "belakang" | "kiri" | "kanan" | "depan";
export type Peran = "netral" | "aksen" | "hantu";
export type Muka = "atas" | "kanan" | "kiri";

export type Primitif =
  | { jenis: "poligon"; muka: Muka | "latar" | "zona" | "pita"; titik: Titik[]; peran: Peran }
  | { jenis: "elips"; cx: number; cy: number; rx: number; ry: number; tingkat: "atas" | "rongga" | "tutup"; peran: Peran }
  | { jenis: "badan"; cx: number; yAtas: number; yBawah: number; rx: number; ry: number; muka: "kanan" | "kiri"; peran: Peran }
  | { jenis: "cakram"; cx: number; cy: number; r: number; sumbuA: Titik; tingkat: "belakang" | "depan" | "polos"; peran: Peran }
  | { jenis: "garis"; dari: Titik; ke: Titik; gaya: "tegas" | "putus" | "air" | "silang" | "panah"; peran: Peran }
  | { jenis: "jalur"; titik: Titik[]; gaya: "selang" | "gagang" | "lengkung"; peran: Peran }
  | { jenis: "baut"; cx: number; cy: number; peran: Peran }
  | { jenis: "tanda"; x: number; y: number; teks: string };

export const LEBAR_KANVAS = 380;
export const TINGGI_KANVAS = 500;
/** Satuan gambar per sentimeter, dipakai khusus untuk angka dari tabel ukuran. */
export const SKALA = 1.2;
/** Tinggi dinding polos pada panel, satuan gambar. */
export const TINGGI_DINDING_PANEL = 310;

const K = Math.sqrt(3) / 2;
const PUSAT_X = LEBAR_KANVAS / 2;
const PUSAT_Y = 400;

/** Proyeksi isometrik titik ruangan (x, y, tinggi) ke kanvas panel. Sumbu x turun ke kanan, y turun ke kiri. */
export const proyeksiPanel = (x: number, y: number, z: number): Titik => [PUSAT_X + K * (x - y), PUSAT_Y + 0.5 * (x + y) - z];

/**
 * Tempat benda dipasang: dinding mana, titik di sepanjang dinding itu, bidang dinding, cara memproyeksikan koordinat
 * ruangan, dan pengali ukuran gambar. Koordinat lokal benda: `a` sepanjang dinding, `n` menjauhi dinding ke dalam
 * ruangan, `u` tinggi. Dinding belakang dan kiri terlihat dari dalam; kanan dan depan terlihat dari belakang benda.
 */
export interface Kerangka {
  dinding: Dinding;
  sepanjang: number;
  bidang: number;
  proyeksi: (x: number, y: number, z: number) => Titik;
  skala: number;
}

export function kerangkaPanel(sisi: SisiDinding): Kerangka {
  return { dinding: sisi === "kanan" ? "belakang" : "kiri", sepanjang: 0, bidang: 0, proyeksi: proyeksiPanel, skala: 1 };
}

function keRuang(k: Kerangka, a: number, n: number): readonly [number, number] {
  switch (k.dinding) {
    case "belakang":
      return [k.sepanjang + a, k.bidang + n];
    case "kiri":
      return [k.bidang + n, k.sepanjang + a];
    case "kanan":
      return [k.bidang - n, k.sepanjang + a];
    case "depan":
      return [k.sepanjang + a, k.bidang - n];
  }
}

/** Titik layar untuk koordinat lokal benda (a, n, u), sudah dikalikan skala gambar. */
export function titik(k: Kerangka, a: number, n: number, u: number): Titik {
  const [x, y] = keRuang(k, a * k.skala, n * k.skala);
  return k.proyeksi(x, y, u * k.skala);
}

/** Arah sumbu `a` di layar (vektor satuan): kanan-bawah atau kiri-bawah. */
function sumbuA(k: Kerangka): Titik {
  const p = titik(k, 0, 0, 0);
  const q = titik(k, 1 / k.skala, 0, 0);
  return [q[0] - p[0], q[1] - p[1]];
}

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

/** Kotak pada koordinat lokal: tiga sisi yang terlihat dari kamera (atas, sisi menghadap kanan-bawah, sisi menghadap kiri-bawah). */
function kotak(k: Kerangka, a0: number, a1: number, n0: number, n1: number, u0: number, u1: number, peran: Peran): Primitif[] {
  const [xa, ya] = keRuang(k, a0 * k.skala, n0 * k.skala);
  const [xb, yb] = keRuang(k, a1 * k.skala, n1 * k.skala);
  const [x0, x1] = [Math.min(xa, xb), Math.max(xa, xb)];
  const [y0, y1] = [Math.min(ya, yb), Math.max(ya, yb)];
  const [z0, z1] = [u0 * k.skala, u1 * k.skala];
  const p = k.proyeksi;
  return [
    poligon("atas", [p(x0, y0, z1), p(x1, y0, z1), p(x1, y1, z1), p(x0, y1, z1)], peran),
    poligon("kanan", [p(x1, y0, z1), p(x1, y1, z1), p(x1, y1, z0), p(x1, y0, z0)], peran),
    poligon("kiri", [p(x0, y1, z1), p(x1, y1, z1), p(x1, y1, z0), p(x0, y1, z0)], peran),
  ];
}

/** Sudut parameter (radian) tempat tepi elips cakram sejajar arah tebal `d`; dipakai untuk garis siluet silinder. */
export function sudutSinggung(sumbu: Titik, d: Titik): number {
  return Math.atan2(d[0], sumbu[0] * d[1] - sumbu[1] * d[0]);
}

const pada = (c: Titik, r: number, sumbu: Titik, theta: number): Titik => [
  c[0] + r * Math.cos(theta) * sumbu[0],
  c[1] + r * (Math.cos(theta) * sumbu[1] - Math.sin(theta)),
];

/**
 * Silinder yang sumbunya menembus bidang `a`-`u` (kepala hand shower): cakram jauh, pita, siluet, cakram dekat.
 * Lubang semprot hanya tampak bila sisi yang menghadap ke ruangan juga menghadap kamera.
 */
function silinderCakram(k: Kerangka, a: number, nMulai: number, tebal: number, u: number, r: number, peran: Peran): Primitif[] {
  const c0 = titik(k, a, nMulai, u);
  const c1 = titik(k, a, nMulai + tebal, u);
  const d: Titik = [c1[0] - c0[0], c1[1] - c0[1]];
  const sumbu = sumbuA(k);
  const rr = r * k.skala;
  const menghadapKamera = d[1] >= 0;
  const [jauh, dekat] = menghadapKamera ? [c0, c1] : [c1, c0];
  const th = sudutSinggung(sumbu, d);
  const b1 = pada(jauh, rr, sumbu, th);
  const b2 = pada(jauh, rr, sumbu, th + Math.PI);
  const d1 = pada(dekat, rr, sumbu, th);
  const d2 = pada(dekat, rr, sumbu, th + Math.PI);
  return [
    { jenis: "cakram", cx: jauh[0], cy: jauh[1], r: rr, sumbuA: sumbu, tingkat: "belakang", peran },
    poligon("pita", [b1, d1, d2, b2], peran),
    { jenis: "garis", dari: b1, ke: d1, gaya: "tegas", peran },
    { jenis: "garis", dari: b2, ke: d2, gaya: "tegas", peran },
    { jenis: "cakram", cx: dekat[0], cy: dekat[1], r: rr, sumbuA: sumbu, tingkat: menghadapKamera ? "depan" : "polos", peran },
  ];
}

/** Silinder berdiri di lantai atau di benda (ember, gayung, kepala shower tetap). `yAtas` = pusat elips tutup, di layar. */
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

/** Selang: ayunan ke arah `arah` (+1 kanan layar, -1 kiri layar), ukuran ayunan mengikuti skala. */
function selang(mulai: Titik, akhir: Titik, pendek: boolean, arah: 1 | -1, s: number, peran: Peran): Primitif {
  const [sx, sy] = mulai;
  const [ex, ey] = akhir;
  const dx = (v: number) => arah * v * s;
  const dy = (v: number) => v * s;
  const pts: Titik[] = pendek
    ? (() => {
        const l: Titik = [ex + dx(24.7), ey + dy(27)];
        return [
          mulai,
          [sx + dx(43.6), sy + dy(10.5)],
          [l[0] + dx(30), l[1] + dy(5)],
          l,
          [l[0] - dx(16), l[1] - dy(3)],
          [ex + dx(3), ey + dy(12)],
          akhir,
        ];
      })()
    : (() => {
        const l: Titik = [ex + dx(31), ey + dy(10)];
        return [
          mulai,
          [sx + dx(56), sy + dy(8)],
          [l[0] + dx(24), l[1] - dy(30)],
          l,
          [l[0] - dx(10), l[1] + dy(12)],
          [ex + dx(7), ey + dy(10)],
          akhir,
        ];
      })();
  return { jenis: "jalur", titik: pts, gaya: "selang", peran };
}

/** Dinding dan lantai polos (putih, hanya garis) untuk panel, supaya gaya mengikuti manual perakitan. */
export function latarPanel(k: Kerangka = kerangkaPanel("kanan")): Primitif[] {
  return [
    poligon("latar", [titik(k, -100, 0, 0), titik(k, 100, 0, 0), titik(k, 100, 80, 0), titik(k, -100, 80, 0)], "netral"),
    poligon(
      "latar",
      [titik(k, -100, 0, 0), titik(k, 100, 0, 0), titik(k, 100, 0, TINGGI_DINDING_PANEL), titik(k, -100, 0, TINGGI_DINDING_PANEL)],
      "netral",
    ),
  ];
}

function keran(k: Kerangka, mode: ModeGambar): Primitif[] {
  const tuas = mode === "permanen";
  return [
    ...kotak(k, -38, -22, 0, 6, 92, 110, "netral"),
    ...kotak(k, -34, -26, 0, 28, 96, 106, "netral"),
    ...kotak(k, -32, -28, 1, 5, 106, 122, tuas ? "aksen" : "netral"),
    ...(tuas ? kotak(k, -32, -28, 2, 40, 122, 128, "aksen") : kotak(k, -40, -20, 0, 8, 122, 128, "netral")),
  ];
}

/** Posisi kait hand shower: tinggi atasnya dan geseran sepanjang dinding. Kondisi = di luar zona; hack/permanen = di batas atas zona. */
export function posisiKait(mode: ModeGambar, ukuran: UkuranShower = ukuranShower()): { uAtas: number; aGeser: number } {
  return mode === "kondisi" ? { uAtas: ukuran.zonaAtas + 100, aGeser: 0 } : { uAtas: ukuran.zonaAtas, aGeser: 35 };
}

function handShower(k: Kerangka, mode: ModeGambar, ukuran: UkuranShower, anotasi: boolean): Primitif[] {
  const s = k.skala;
  const arah: 1 | -1 = sumbuA(k)[0] >= 0 ? 1 : -1;
  const { uAtas, aGeser } = posisiKait(mode, ukuran);
  const lama = posisiKait("kondisi", ukuran);
  const peran: Peran = mode === "kondisi" ? "netral" : "aksen";
  const uBawahGagang = mode === "kondisi" ? uAtas - 57 : uAtas - 17;
  const hasil: Primitif[] = [];

  if (anotasi) {
    hasil.push(
      poligon(
        "zona",
        [
          titik(k, -100, 0, ukuran.zonaBawah),
          titik(k, 100, 0, ukuran.zonaBawah),
          titik(k, 100, 0, ukuran.zonaAtas),
          titik(k, -100, 0, ukuran.zonaAtas),
        ],
        "aksen",
      ),
    );
  }
  hasil.push(...keran(k, mode));
  if (mode === "hack") hasil.push(...kotak(k, -8, 8, 0, 12, lama.uAtas - 20, lama.uAtas, "hantu"));
  hasil.push(selang(titik(k, aGeser + 4, 20, uBawahGagang), titik(k, 30, 10, 101), mode !== "kondisi", arah, s, "netral"));
  hasil.push(...kotak(k, 26, 34, 0, 10, 96, 106, "netral"));
  hasil.push(...kotak(k, aGeser - 8, aGeser + 8, 0, 12, uAtas - 20, uAtas, peran));
  if (mode === "permanen") {
    for (const u of [uAtas - 6.5, uAtas - 18.5]) {
      const [cx, cy] = titik(k, aGeser - 3, 12, u);
      hasil.push({ jenis: "baut", cx, cy, peran });
    }
  }
  hasil.push(...kotak(k, aGeser - 4, aGeser + 4, 12, 20, uBawahGagang, uAtas + 17, peran));
  hasil.push(...silinderCakram(k, aGeser, 14, 10, uAtas + 25, 22, peran));

  if (anotasi && mode === "kondisi") {
    const dasar = titik(k, 50, 0, ukuran.zonaAtas);
    const ujung = titik(k, 50, 0, ukuran.zonaAtas + 79);
    const [cx, cy] = titik(k, 50, 0, ukuran.zonaAtas + 98);
    const h = 11 * s;
    hasil.push({ jenis: "garis", dari: dasar, ke: ujung, gaya: "putus", peran: "netral" });
    hasil.push({ jenis: "garis", dari: [cx - h, cy - h], ke: [cx + h, cy + h], gaya: "silang", peran: "netral" });
    hasil.push({ jenis: "garis", dari: [cx + h, cy - h], ke: [cx - h, cy + h], gaya: "silang", peran: "netral" });
  }
  if (anotasi && mode === "hack") {
    hasil.push({ jenis: "garis", dari: titik(k, 65, 0, lama.uAtas - 4), ke: titik(k, 65, 0, uAtas + 33), gaya: "panah", peran: "netral" });
  }
  return hasil;
}

function showerTetap(k: Kerangka, ukuran: UkuranShower): Primitif[] {
  const s = k.skala;
  const uP = ukuran.zonaAtas + 130;
  const [cx, cyAtas] = titik(k, 0, 50, uP - 11);
  return [
    ...keran(k, "kondisi"),
    ...[-19, 0, 19].map((dx, i): Primitif => {
      const turun = i === 1 ? 5 : 0;
      return {
        jenis: "garis",
        dari: [cx + dx * s, cyAtas + (36 + turun) * s],
        ke: [cx + dx * s, cyAtas + (74 + turun) * s],
        gaya: "air",
        peran: "netral",
      };
    }),
    ...silinderTegak(cx, cyAtas, 24 * s, 10 * s, "kiri", false, "netral"),
    ...kotak(k, -8, 8, 0, 6, uP - 12, uP + 4, "netral"),
    ...kotak(k, -2.5, 2.5, 6, 50, uP - 6, uP, "netral"),
  ];
}

function emberGayung(k: Kerangka): Primitif[] {
  const s = k.skala;
  const arah = sumbuA(k)[0] >= 0 ? 1 : -1;
  const [ex, eyBawah] = titik(k, -30, 40, 0);
  const tinggiEmber = 55 * s;
  const yAtasEmber = eyBawah - tinggiEmber;
  const [gx, gyBawah] = titik(k, 10, 30, 0);
  const ujungKeran = titik(k, -30, 28, 96);
  return [
    ...keran(k, "kondisi"),
    {
      jenis: "garis",
      dari: [ujungKeran[0] - arah * 0.3 * s, ujungKeran[1] + 9 * s],
      ke: [ujungKeran[0] - arah * 7.8 * s, yAtasEmber - 10 * s],
      gaya: "air",
      peran: "netral",
    },
    {
      jenis: "jalur",
      titik: [
        [ex - arah * 25.4 * s, yAtasEmber - 4 * s],
        [ex - arah * 31.4 * s, yAtasEmber - 50 * s],
        [ex + arah * 30.6 * s, yAtasEmber - 50 * s],
        [ex + arah * 25.6 * s, yAtasEmber - 4 * s],
      ],
      gaya: "lengkung",
      peran: "netral",
    },
    ...silinderTegak(ex, yAtasEmber, 22 * s, tinggiEmber, "kanan", true, "netral"),
    {
      jenis: "jalur",
      titik: [
        [gx + arah * 9.3 * s, gyBawah - 14 * s],
        [gx + arah * 41.3 * s, gyBawah - 28 * s],
      ],
      gaya: "gagang",
      peran: "netral",
    },
    ...silinderTegak(gx, gyBawah - 14 * s, 9 * s, 14 * s, "kanan", true, "netral"),
  ];
}

function tidakJelas(k: Kerangka): Primitif[] {
  const [tx, ty] = titik(k, 0, 30, 170);
  return [...kotak(k, -20, 20, 0, 30, 140, 200, "hantu"), { jenis: "tanda", x: tx, y: ty + 11 * k.skala, teks: "?" }];
}

/**
 * Gambar satu varian shower pada dinding, urutan gambar dari belakang ke depan. `mode` hanya berpengaruh pada hand
 * shower (kondisi dari foto, hack tanpa bongkar, permanen/renovasi). `anotasi` menambah zona jangkauan, silang, dan
 * panah. Tanpa `kerangka`, benda dipasang di dinding kanan panel.
 */
export function gambarShower(
  varian: VarianShower,
  mode: ModeGambar = "kondisi",
  opsi: { anotasi?: boolean; ukuran?: UkuranShower; kerangka?: Kerangka } = {},
): Primitif[] {
  const ukuran = opsi.ukuran ?? ukuranShower();
  const k = opsi.kerangka ?? kerangkaPanel("kanan");
  switch (varian) {
    case "hand_shower_gantung":
      return handShower(k, mode, ukuran, opsi.anotasi ?? false);
    case "shower_tetap":
      return showerTetap(k, ukuran);
    case "ember_gayung":
      return emberGayung(k);
    case "tidak_jelas":
      return tidakJelas(k);
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

/** Gambar lengkap untuk panel: latar polos + varian pada dinding kanan (belakang) atau kiri. */
export function susunGambar(
  varian: VarianShower,
  mode: ModeGambar,
  sisi: SisiDinding,
  opsi: { anotasi?: boolean; latar?: boolean } = {},
): Primitif[] {
  const k = kerangkaPanel(sisi);
  return [...(opsi.latar === false ? [] : latarPanel(k)), ...gambarShower(varian, mode, { anotasi: opsi.anotasi, kerangka: k })];
}
