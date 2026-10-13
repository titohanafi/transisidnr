import { describe, expect, it } from "vitest";
import { konten } from "../src/domain/content";

describe("bantuan di check-in", () => {
  const pilihan = konten.ui.checkin.pilihan;
  it("setiap perasaan punya tombol bantuan", () => {
    for (const p of pilihan) expect(p.bantuan.tombol.length).toBeGreaterThan(0);
  });
  it("tujuan berupa alamat dalam aplikasi atau panduan yang ada", () => {
    for (const p of pilihan) {
      const { ke, panduan } = p.bantuan;
      expect(Boolean(ke) !== Boolean(panduan)).toBe(true);
      if (panduan) expect(konten.kartu.some((k) => k.id === panduan)).toBe(true);
    }
  });
});
