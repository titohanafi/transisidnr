// Gambar akses mandi (M-08): bak mandi tembok dengan bibir tinggi, ember di atas bangku setinggi jangkauan, dan area shower
// tanpa undakan. Dibangun dengan alat yang sama dengan shower dan benda lain, dalam cm nyata (lihat `dimensiGambar.ts`):
// tinggi bangku dan lebar bilik dari tabel PerMen, ukuran bak mandi perkiraan.
import { DIM } from "./dimensiGambar";
import {
  ekstrusi,
  footprintOval,
  kerangkaPanel,
  kotak,
  latarPanel,
  poligon,
  titik,
  type Kerangka,
  type ModeGambar,
  type Primitif,
  type SisiDinding,
} from "./gambarShower";

const A_BAK: [number, number] = [-70, -70 + DIM.akses.panjangBak];
const A_BANGKU: [number, number] = [A_BAK[1] + 6, A_BAK[1] + 36];

function bakMandi(k: Kerangka, peran: "netral" | "hantu"): Primitif[] {
  const { dalamBak, bibirBak } = DIM.akses;
  const [a0, a1] = A_BAK;
  const hasil: Primitif[] = [...kotak(k, a0, a1, 0, dalamBak, 0, bibirBak, peran)];
  if (peran === "netral") {
    const dalam = [
      titik(k, a0 + 7, 7, bibirBak),
      titik(k, a1 - 7, 7, bibirBak),
      titik(k, a1 - 7, dalamBak - 7, bibirBak),
      titik(k, a0 + 7, dalamBak - 7, bibirBak),
    ];
    hasil.push(poligon("rongga", dalam, "netral"));
  }
  return hasil;
}

/** Ember berisi air di atas bangku: badan bulat, cekungan, dan gagang lengkung (aksen: perubahan yang disarankan). */
function ember(k: Kerangka, a: number, n: number, u0: number): Primitif[] {
  const tinggi = 25;
  const r = 11;
  return [
    ...ekstrusi(k, footprintOval(a, n, r, r, 24), u0, u0 + tinggi, "aksen", true),
    poligon(
      "rongga",
      footprintOval(a, n, r - 2.5, r - 2.5, 24).map(([x, y]) => titik(k, x, y, u0 + tinggi)),
      "aksen",
    ),
    {
      jenis: "jalur",
      titik: [
        titik(k, a - r, n, u0 + tinggi),
        titik(k, a - r, n, u0 + tinggi + 22),
        titik(k, a + r, n, u0 + tinggi + 22),
        titik(k, a + r, n, u0 + tinggi),
      ],
      gaya: "lengkung",
      peran: "aksen",
    },
  ];
}

/** Satu langkah gambar akses mandi: kondisi (bak terhalang), hack (ember di bangku), permanen (area shower rata). */
export function gambarAkses(mode: ModeGambar, k: Kerangka = kerangkaPanel("kanan")): Primitif[] {
  const { tempatDuduk, lebarBilik, dalamBilik, bibirBak } = DIM.akses;
  if (mode === "kondisi") {
    const [a0] = A_BAK;
    const pusatX = a0 + 55;
    // Silang di muka bak: jalan masuk terhalang bibir bak.
    const mukaBak = DIM.akses.dalamBak + 2;
    const silang = (da: 1 | -1): Primitif => ({
      jenis: "garis",
      dari: titik(k, pusatX - 8 * da, mukaBak, bibirBak - 4),
      ke: titik(k, pusatX + 8 * da, mukaBak, bibirBak + 20),
      gaya: "silang",
      peran: "netral",
    });
    return [
      ...bakMandi(k, "netral"),
      {
        jenis: "garis",
        dari: titik(k, a0 - 6, 92, 0),
        ke: titik(k, a0 + 6, DIM.akses.dalamBak + 4, bibirBak - 10),
        gaya: "panah",
        peran: "netral",
      },
      silang(1),
      silang(-1),
    ];
  }
  if (mode === "hack") {
    const [b0, b1] = A_BANGKU;
    return [...bakMandi(k, "netral"), ...kotak(k, b0, b1, 4, 44, 0, tempatDuduk, "aksen"), ...ember(k, (b0 + b1) / 2, 24, tempatDuduk)];
  }
  const [a0, a1] = [-lebarBilik / 2, lebarBilik / 2];
  const panah = (a: number): Primitif => ({
    jenis: "garis",
    dari: titik(k, a, 24, 0),
    ke: titik(k, a, 52, 0),
    gaya: "panah",
    peran: "aksen",
  });
  return [
    ...bakMandi(k, "hantu"),
    poligon("atas", [titik(k, a0, 0, 0), titik(k, a1, 0, 0), titik(k, a1, dalamBilik, 0), titik(k, a0, dalamBilik, 0)], "aksen"),
    ...kotak(k, a0, a1, dalamBilik - 5, dalamBilik, 0, 1.5, "aksen"),
    panah(-25),
    panah(0),
    panah(25),
  ];
}

/** Gambar lengkap untuk panel M-08: latar polos berkeramik + gambar akses pada dinding kanan (belakang) atau kiri. */
export function susunAkses(mode: ModeGambar, sisi: SisiDinding, opsi: { latar?: boolean } = {}): Primitif[] {
  const k = kerangkaPanel(sisi);
  return [...(opsi.latar === false ? [] : latarPanel(k)), ...gambarAkses(mode, k)];
}
