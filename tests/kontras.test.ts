import { describe, expect, it } from "vitest";
import config from "../tailwind.config";

type Warna = string | { DEFAULT: string; [k: string]: string };
const w = config.theme!.extend!.colors as Record<string, Warna>;
const hex = (k: string, v?: string): string => {
  const x = w[k];
  return typeof x === "string" ? x : x[v ?? "DEFAULT"];
};

function luminans(h: string): number {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export const rasio = (a: string, b: string): number => {
  const [x, y] = [luminans(a), luminans(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

const putih = "#FFFFFF";

// Pasangan teks/latar yang benar-benar dipakai di komponen. Teks biasa butuh 4.5:1 (WCAG AA).
const teks: [string, string, string][] = [
  ["tinta di kertas", hex("tinta"), hex("kertas")],
  ["tinta di putih", hex("tinta"), putih],
  ["tinta di utama-muda", hex("tinta"), hex("utama", "muda")],
  ["redup di kertas", hex("redup"), hex("kertas")],
  ["redup di putih", hex("redup"), putih],
  ["utama di kertas (tautan)", hex("utama"), hex("kertas")],
  ["utama di putih", hex("utama"), putih],
  ["putih di utama (tombol)", putih, hex("utama")],
  ["putih di utama-gelap (hover)", putih, hex("utama", "gelap")],
  ["utama di utama-muda", hex("utama"), hex("utama", "muda")],
  ["utama-gelap di utama-muda (lencana)", hex("utama", "gelap"), hex("utama", "muda")],
  ["draf di draf-muda (lencana)", hex("draf"), hex("draf", "muda")],
  ["aksen di aksen-muda", hex("aksen"), hex("aksen", "muda")],
  ["aksen di putih (lencana)", hex("aksen"), putih],
  ["tinta di aksen-muda", hex("tinta"), hex("aksen", "muda")],
  ["tinta di permukaan", hex("tinta"), hex("permukaan")],
  ["redup di permukaan", hex("redup"), hex("permukaan")],
  ["info di info-muda", hex("info"), hex("info", "muda")],
  ["tinta di info-muda", hex("tinta"), hex("info", "muda")],
  ["info di putih (ikon)", hex("info"), putih],
  ["bahaya di kertas", hex("bahaya"), hex("kertas")],
  ["bahaya di putih", hex("bahaya"), putih],
  ["putih di bahaya (tombol)", putih, hex("bahaya")],
  ["bahaya di bahaya-muda (kartu darurat)", hex("bahaya"), hex("bahaya", "muda")],
  ["tinta di bahaya-muda", hex("tinta"), hex("bahaya", "muda")],
  ["catatan di catatan-muda (catatan kuning)", hex("catatan"), hex("catatan", "muda")],
  ["putih di utama (judul kartu hero)", putih, hex("utama")],
  ["utama-redup di utama (deskripsi kartu hero)", hex("utama", "redup"), hex("utama")],
  ["utama-redup di utama-gelap (lingkaran hiasan)", hex("utama", "redup"), hex("utama", "gelap")],
];

describe("kontras warna (WCAG 2.2 AA)", () => {
  it.each(teks)("%s ≥ 4.5:1", (_n, depan, latar) => {
    expect(rasio(depan, latar)).toBeGreaterThanOrEqual(4.5);
  });

  it("batas kontrol formulir (textarea) ≥ 3:1 terhadap latar", () => {
    expect(rasio(hex("garisKontrol"), putih)).toBeGreaterThanOrEqual(3);
  });

  it("ikon utama-gelap di atas tombol cari hijau daun ≥ 3:1", () => {
    expect(rasio(hex("utama", "gelap"), hex("daun"))).toBeGreaterThanOrEqual(3);
  });

  it("ikon daun di atas kartu hero (grafis) ≥ 3:1", () => {
    expect(rasio(hex("daun"), hex("utama"))).toBeGreaterThanOrEqual(3);
  });

  it("cincin fokus (utama) ≥ 3:1 terhadap kertas dan putih", () => {
    expect(rasio(hex("utama"), hex("kertas"))).toBeGreaterThanOrEqual(3);
    expect(rasio(hex("utama"), putih)).toBeGreaterThanOrEqual(3);
  });
});
