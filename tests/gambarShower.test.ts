import { describe, expect, it } from "vitest";
import {
  LEBAR_KANVAS,
  SKALA,
  TINGGI_KANVAS,
  gambarShower,
  langkahGambarShower,
  latarPanel,
  kerangkaPanel,
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

// Pembanding: dinding kiri harus sama dengan dinding belakang yang dicerminkan terhadap sumbu tengah kanvas,
// dengan sisi terang/gelap (muka kanan/kiri) bertukar.
function cerminkanUji(daftar: Primitif[]): Primitif[] {
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
        // badan silinder tegak: nada terang/gelapnya tetap (cahaya dari arah yang sama), tidak ikut tertukar
        return { ...s, cx: x(s.cx) };
      case "cakram":
        return { ...s, cx: x(s.cx), sumbuA: [-s.sumbuA[0], s.sumbuA[1]] };
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
// Urutan titik pada poligon dan urutan sisi satu kotak boleh beda (arah putar berbalik saat dicerminkan); yang
// dibandingkan bentuknya.
const bulat = (v: number) => Math.round(v * 1e4) / 1e4 + 0;
const bulatkan = (daftar: Primitif[]) =>
  JSON.stringify(
    daftar
      .map((s) =>
        JSON.stringify(
          s.jenis === "poligon"
            ? { ...s, titik: [...s.titik].map(([a, b]) => [bulat(a), bulat(b)]).sort((p, q) => p[0] - q[0] || p[1] - q[1]) }
            : s,
          (_k, v: unknown) => (typeof v === "number" ? bulat(v) : v),
        ),
      )
      .sort(),
  );

describe("dinding kiri", () => {
  it.each(VARIAN_SHOWER.flatMap((v) => MODE.map((m) => [v, m] as const)))(
    "%s / %s: sama dengan dinding kanan yang dicerminkan",
    (varian, mode) => {
      const kanan = susunGambar(varian, mode, "kanan", { anotasi: true });
      const kiri = susunGambar(varian, mode, "kiri", { anotasi: true });
      expect(bulatkan(kiri)).toBe(bulatkan(cerminkanUji(kanan)));
    },
  );
});

describe("kerangka dinding di ruangan", () => {
  const proyeksi = (x: number, y: number, z: number): Titik => [(x - y) * Math.cos(Math.PI / 6) + 283, (x + y) * 0.5 - z + 215];
  const dindingSemua = ["belakang", "kiri", "kanan", "depan"] as const;

  it.each(dindingSemua)("benda di dinding %s menjorok ke dalam ruangan 200x300", (dinding) => {
    const bidang = { belakang: 0, kiri: 0, kanan: 200, depan: 300 }[dinding];
    const sepanjang = dinding === "belakang" || dinding === "depan" ? 100 : 150;
    const k = { dinding, sepanjang, bidang, proyeksi, skala: 0.6 };
    const dasar = titik(k, 0, 0, 0);
    const masuk = titik(k, 0, 40, 0);
    const [x, y] = [masuk[0] - dasar[0], masuk[1] - dasar[1]];
    // menjauhi dinding ke dalam: belakang +y (kiri-bawah), kiri +x (kanan-bawah), kanan -x (kiri-atas), depan -y (kanan-atas)
    const diharapkan = { belakang: [-1, 1], kiri: [1, 1], kanan: [-1, -1], depan: [1, -1] }[dinding];
    expect(Math.sign(x)).toBe(diharapkan[0]);
    expect(Math.sign(y)).toBe(diharapkan[1]);
  });

  it.each(dindingSemua)("skala mengecilkan seluruh gambar secara seragam di dinding %s", (dinding) => {
    const mk = (skala: number) => ({
      dinding,
      sepanjang: 0,
      bidang: 0,
      proyeksi: (x: number, y: number, z: number): Titik => [x - y, x + y - z],
      skala,
    });
    const a = gambarShower("hand_shower_gantung", "kondisi", { kerangka: mk(1) });
    const b = gambarShower("hand_shower_gantung", "kondisi", { kerangka: mk(0.5) });
    expect(b).toHaveLength(a.length);
    const jangkauan = (d: Primitif[]) => {
      const pts = d.flatMap(semuaTitik);
      const xs = pts.map((p) => p[0]);
      const ys = pts.map((p) => p[1]);
      return [Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)];
    };
    const [wa, ha] = jangkauan(a);
    const [wb, hb] = jangkauan(b);
    expect(wb / wa).toBeGreaterThan(0.4);
    expect(wb / wa).toBeLessThan(0.65);
    expect(hb / ha).toBeGreaterThan(0.4);
    expect(hb / ha).toBeLessThan(0.65);
  });

  it("semua varian bisa digambar di semua dinding tanpa titik tak terhingga", () => {
    for (const dinding of dindingSemua) {
      for (const v of VARIAN_SHOWER) {
        const k = { dinding, sepanjang: 50, bidang: 0, proyeksi, skala: 0.6 };
        for (const m of MODE) {
          for (const p of gambarShower(v, m, { kerangka: k })) {
            for (const [x, y] of semuaTitik(p)) expect(Number.isFinite(x) && Number.isFinite(y)).toBe(true);
          }
        }
      }
    }
  });
});

describe("proyeksi", () => {
  it("naik satu satuan tinggi menggeser titik satu satuan ke atas layar", () => {
    const k = kerangkaPanel("kanan");
    const [x1, y1] = titik(k, 10, 5, 0);
    const [x2, y2] = titik(k, 10, 5, 1);
    expect(x2).toBe(x1);
    expect(y2).toBeCloseTo(y1 - 1);
  });
  it("sudut singgung silinder cakram: garis siluet sejajar arah tebal", () => {
    const d: Titik = [-8.66, 5];
    const sumbu: Titik = [Math.sqrt(3) / 2, 0.5];
    const th = sudutSinggung(sumbu, d);
    const turunan: Titik = [-Math.sin(th) * sumbu[0], -Math.sin(th) * sumbu[1] - Math.cos(th)];
    expect(turunan[0] * d[1] - turunan[1] * d[0]).toBeCloseTo(0);
  });
});

describe("langkah gambar yang ditampilkan", () => {
  it("tiga langkah hanya untuk hand shower yang perlu perhatian", () => {
    expect(langkahGambarShower("hand_shower_gantung", true)).toEqual(["kondisi", "hack", "permanen"]);
    expect(langkahGambarShower("hand_shower_gantung", false)).toEqual(["kondisi"]);
  });
  it("varian lain hanya kondisi, dan tidak_jelas tanpa gambar", () => {
    expect(langkahGambarShower("shower_tetap", true)).toEqual(["kondisi"]);
    expect(langkahGambarShower("ember_gayung", true)).toEqual(["kondisi"]);
    expect(langkahGambarShower("tidak_jelas", true)).toEqual([]);
  });
});
