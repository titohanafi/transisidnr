import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ukuranAksesibelSchema } from "../src/domain/schema";

const baca = (): unknown => JSON.parse(readFileSync(join(__dirname, "..", "content", "ukuran-aksesibel.json"), "utf8"));

describe("ukuran aksesibel", () => {
  it("tabel asli valid", () => {
    expect(ukuranAksesibelSchema.parse(baca()).entri.length).toBeGreaterThan(0);
  });

  it("semua angka masih draf sampai ditinjau ahli", () => {
    const u = ukuranAksesibelSchema.parse(baca());
    expect(u.entri.filter((e) => e.status_validasi !== "draf")).toEqual([]);
  });

  it("tiap ukuran terhubung ke indikator M-01 sampai M-12", () => {
    const u = ukuranAksesibelSchema.parse(baca());
    for (const e of u.entri) {
      expect(e.indikator.length, e.id).toBeGreaterThan(0);
      for (const m of e.indikator) expect(Number(m.slice(2)), `${e.id} ${m}`).toBeGreaterThanOrEqual(1);
      for (const m of e.indikator) expect(Number(m.slice(2)), `${e.id} ${m}`).toBeLessThanOrEqual(12);
    }
  });

  it("nilai PerMen selalu didaftar sebelum nilai ADA", () => {
    const u = ukuranAksesibelSchema.parse(baca());
    for (const e of u.entri) {
      const urutan = e.nilai.map((n) => n.rujukan);
      const adaPertama = urutan.indexOf("ada_2010");
      const permenSetelahAda = adaPertama >= 0 && urutan.slice(adaPertama).includes("permen_pupr_14_2017");
      expect(permenSetelahAda, e.id).toBe(false);
    }
  });

  it("gagal bila nilai menunjuk rujukan yang tidak ada", () => {
    const u = structuredClone(baca()) as { entri: { nilai: { rujukan: string }[] }[] };
    u.entri[0].nilai[0].rujukan = "tidak_ada";
    expect(() => ukuranAksesibelSchema.parse(u)).toThrow(/rujukan yang tidak ada/);
  });

  it("gagal bila sebuah nilai tidak punya angka", () => {
    const u = structuredClone(baca()) as { entri: { nilai: Record<string, unknown>[] }[] };
    u.entri[0].nilai[0] = { rujukan: "permen_pupr_14_2017", rincian: "x", sifat: "saran", dibaca_dari_gambar: false };
    expect(() => ukuranAksesibelSchema.parse(u)).toThrow(/minimal satu angka/);
  });

  it("gagal bila min lebih besar dari maks", () => {
    const u = structuredClone(baca()) as { entri: { nilai: Record<string, unknown>[] }[] };
    u.entri[0].nilai[0] = { ...u.entri[0].nilai[0], min_cm: 100, maks_cm: 50 };
    expect(() => ukuranAksesibelSchema.parse(u)).toThrow(/lebih besar/);
  });
});
