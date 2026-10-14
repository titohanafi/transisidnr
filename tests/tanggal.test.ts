import { describe, expect, it } from "vitest";
import { bagianHari, hariTerakhir, kunciHari, pangkasRiwayat } from "../src/lib/tanggal";

describe("tanggal", () => {
  it("kunciHari memakai tanggal lokal dengan nol di depan", () => {
    expect(kunciHari(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
  });
  it("hariTerakhir berurutan dari yang terbaru dan melewati pergantian bulan", () => {
    expect(hariTerakhir(3, new Date(2026, 2, 1))).toEqual(["2026-03-01", "2026-02-28", "2026-02-27"]);
  });
  it("pangkasRiwayat menyimpan hari terbaru saja", () => {
    const r = { "2026-01-01": "a", "2026-01-02": "b", "2026-01-03": "c" };
    expect(pangkasRiwayat(r, 2)).toEqual({ "2026-01-03": "c", "2026-01-02": "b" });
  });
});

describe("bagianHari", () => {
  it.each([
    [3, "malam"],
    [4, "pagi"],
    [10, "pagi"],
    [11, "siang"],
    [14, "siang"],
    [15, "sore"],
    [17, "sore"],
    [18, "malam"],
    [23, "malam"],
  ] as const)("jam %i adalah %s", (jam, bagian) => {
    expect(bagianHari(new Date(2026, 0, 5, jam, 30))).toBe(bagian);
  });
});
