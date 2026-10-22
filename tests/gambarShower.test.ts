import { describe, expect, it } from "vitest";
import {
  LEBAR_KANVAS,
  SKALA,
  TINGGI_KANVAS,
  cerminkan,
  gambarShower,
  latarPanel,
  posisiKait,
  sudutSinggung,
  susunGambar,
  titik,
  ukuranShower,
  type ModeGambar,
  type Primitif,
  type Titik,
} from "../src/domain/gambarShower";
import { VARIAN_SHOWER } from "../src/domain/pindai";
import { UKURAN_AKSESIBEL, nilaiAcuan } from "../src/domain/ukuranAksesibel";

const MODE: ModeGambar[] = ["kondisi", "hack", "permanen"];

function semuaTitik(p: Primitif): Titik[] {
  switch (p.jenis) {
    case "poligon":
    case "jalur":
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
        [p.cx - p.r, p.cy - p.r],
        [p.cx + p.r, p.cy + p.r],
      ];
    case "baut":
      return [[p.cx, p.cy]];
    case "tanda":
      return [[p.x, p.y]];
  }
}

describe("nilai acuan ukuran", () => {
  it("PerMen diutamakan, ADA dipakai bila PerMen tidak punya angkanya", () => {
    expect(nilaiAcuan("pancuran-tinggi-kran", "maks_cm")).toMatchObject({ cm: 120, rujukan: "permen_pupr_14_2017" });
    expect(nilaiAcuan("pancuran-selang-hand-shower", "min_cm")).toMatchObject({ cm: 150, rujukan: "ada_2010" });
  });
  it("kosong bila id atau kunci tidak ada", () => {
    expect(nilaiAcuan("tidak-ada", "min_cm")).toBeNull();
    expect(nilaiAcuan("pancuran-tinggi-kran", "lebar_cm")).toBeNull();
  });
  it("urutan di tabel tidak menentukan: PerMen tetap menang walau ditaruh setelah ADA", () => {
    const t = structuredClone(UKURAN_AKSESIBEL);
    const e = t.entri.find((x) => x.id === "pancuran-tinggi-kran");
    e?.nilai.reverse();
    expect(nilaiAcuan("pancuran-tinggi-kran", "maks_cm", t)?.rujukan).toBe("permen_pupr_14_2017");
  });
});

describe("ukuran shower dari tabel", () => {
  it("zona jangkauan diturunkan dari tabel dengan skala gambar", () => {
    const u = ukuranShower();
    expect(u.zonaAtas).toBeCloseTo(120 * SKALA);
    expect(u.zonaBawah).toBeCloseTo(38 * SKALA);
    expect(u.zonaBawah).toBeLessThan(u.zonaAtas);
  });
});

describe("posisi kait hand shower", () => {
  it("kondisi di luar zona jangkauan, hack dan permanen di dalam", () => {
    const u = ukuranShower();
    expect(posisiKait("kondisi", u).uAtas).toBeGreaterThan(u.zonaAtas);
    expect(posisiKait("hack", u).uAtas).toBeLessThanOrEqual(u.zonaAtas);
    expect(posisiKait("permanen", u).uAtas).toBeLessThanOrEqual(u.zonaAtas);
  });
});

describe("gambar shower", () => {
  it.each(VARIAN_SHOWER.flatMap((v) => MODE.map((m) => [v, m] as const)))(
    "%s / %s: semua titik terhingga dan di dalam kanvas",
    (varian, mode) => {
      const daftar = susunGambar(varian, mode, "kanan", { anotasi: true });
      expect(daftar.length).toBeGreaterThan(0);
      for (const p of daftar) {
        for (const [x, y] of semuaTitik(p)) {
          expect(Number.isFinite(x) && Number.isFinite(y)).toBe(true);
          expect(x).toBeGreaterThanOrEqual(-1);
          expect(x).toBeLessThanOrEqual(LEBAR_KANVAS + 1);
          expect(y).toBeGreaterThanOrEqual(-1);
          expect(y).toBeLessThanOrEqual(TINGGI_KANVAS + 1);
        }
      }
    },
  );

  it("tidak_jelas hanya berisi bentuk bergaris putus-putus, tanpa benda padat", () => {
    const padat = gambarShower("tidak_jelas").filter((p) => "peran" in p && p.peran !== "hantu");
    expect(padat).toEqual([]);
  });

  it("hack memberi bayangan posisi lama dan bagian baru beraksen; permanen beraksen tanpa bayangan", () => {
    const peran = (m: ModeGambar) => new Set(gambarShower("hand_shower_gantung", m).flatMap((p) => ("peran" in p ? [p.peran] : [])));
    expect(peran("kondisi")).toEqual(new Set(["netral"]));
    expect(peran("hack")).toEqual(new Set(["netral", "aksen", "hantu"]));
    expect(peran("permanen")).toEqual(new Set(["netral", "aksen"]));
  });

  it("permanen memasang baut dan hack tidak", () => {
    const jumlahBaut = (m: ModeGambar) => gambarShower("hand_shower_gantung", m).filter((p) => p.jenis === "baut").length;
    expect(jumlahBaut("permanen")).toBe(2);
    expect(jumlahBaut("hack")).toBe(0);
  });

  it("anotasi hanya muncul bila diminta", () => {
    const tanpa = gambarShower("hand_shower_gantung", "kondisi");
    const dengan = gambarShower("hand_shower_gantung", "kondisi", { anotasi: true });
    expect(dengan.length).toBeGreaterThan(tanpa.length);
    expect(dengan.some((p) => p.jenis === "poligon" && p.muka === "zona")).toBe(true);
    expect(tanpa.some((p) => p.jenis === "poligon" && p.muka === "zona")).toBe(false);
  });

  it("gambar tidak pernah memuat angka sebagai tulisan", () => {
    for (const v of VARIAN_SHOWER) {
      for (const m of MODE) {
        const teks = susunGambar(v, m, "kanan", { anotasi: true }).flatMap((p) => (p.jenis === "tanda" ? [p.teks] : []));
        for (const t of teks) expect(t).not.toMatch(/\d/);
      }
    }
  });

  it("latar dinding dan lantai polos tanpa tekstur", () => {
    const l = latarPanel();
    expect(l).toHaveLength(2);
    expect(l.every((p) => p.jenis === "poligon" && p.muka === "latar")).toBe(true);
  });
});

describe("cermin dinding kiri", () => {
  it("mencerminkan x terhadap sumbu tengah dan menukar sisi terang/gelap", () => {
    const kanan = susunGambar("hand_shower_gantung", "hack", "kanan", { anotasi: true });
    const kiri = susunGambar("hand_shower_gantung", "hack", "kiri", { anotasi: true });
    expect(kiri).toHaveLength(kanan.length);
    const a = kanan.find((p) => p.jenis === "poligon" && p.muka === "kanan");
    const b = cerminkan(kanan).find((p) => p.jenis === "poligon" && p.muka === "kiri");
    expect(a?.jenis === "poligon" && b?.jenis === "poligon" ? b.titik[0][0] : NaN).toBeCloseTo(
      LEBAR_KANVAS - (a?.jenis === "poligon" ? a.titik[0][0] : 0),
    );
  });
  it("mencerminkan dua kali mengembalikan gambar semula", () => {
    const d = gambarShower("ember_gayung");
    const bulatkan = (x: unknown) => JSON.stringify(x, (_k, v: unknown) => (typeof v === "number" ? Math.round(v * 1e6) / 1e6 : v));
    expect(bulatkan(cerminkan(cerminkan(d)))).toBe(bulatkan(d));
  });
});

describe("proyeksi", () => {
  it("naik satu satuan tinggi menggeser titik satu satuan ke atas layar", () => {
    const [x1, y1] = titik(10, 5, 0);
    const [x2, y2] = titik(10, 5, 1);
    expect(x2).toBe(x1);
    expect(y2).toBeCloseTo(y1 - 1);
  });
  it("sudut singgung silinder cakram: garis siluet sejajar arah tebal", () => {
    const d: Titik = [-8.66, 5];
    const th = sudutSinggung(1, d);
    const K = Math.sqrt(3) / 2;
    const turunan: Titik = [-Math.sin(th) * K, -Math.sin(th) * 0.5 - Math.cos(th)];
    expect(turunan[0] * d[1] - turunan[1] * d[0]).toBeCloseTo(0);
  });
});
