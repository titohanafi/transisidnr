import { describe, expect, it } from "vitest";
import {
  footprintDindingKanan,
  footprintDindingKiri,
  footprintDindingSamping,
  footprintTiangSudut,
  KLOSET_TINGGI_MANGKUK,
  TANGKI_OVERLAP_Z,
  TANGKI_PUSH_IN,
  TANGKI_SENTUH_PERSIS,
  TANGKI_Z_MULAI,
  WASTAFEL_KERAN_PUSH_IN,
} from "../src/domain/denahIsoGeometri";

describe("tuning kloset/wastafel isometrik: kunci regresi (nilai dipertahankan sejak sebelum Milestone 2)", () => {
  // Nilai di bawah ini SENGAJA ditala manual lewat tes langsung di browser (lihat komentar di
  // src/domain/denahIsoGeometri.ts) — kalau test ini gagal karena angkanya berubah, itu pertanda perubahan
  // tersebut perlu dicek ulang visual di browser, bukan dianggap regresi otomatis yang harus "diperbaiki" ke
  // angka baru begitu saja.
  it("tangki kloset didorong lebih dekat dari jarak pas-bersentuhan (tumpang tindih disengaja)", () => {
    expect(TANGKI_PUSH_IN).toBe(-28);
    expect(Math.abs(TANGKI_PUSH_IN)).toBeLessThan(TANGKI_SENTUH_PERSIS);
  });

  it("tangki kloset mulai tumpang tindih dengan mangkuk di sumbu z", () => {
    expect(TANGKI_Z_MULAI).toBe(14);
    expect(TANGKI_OVERLAP_Z).toBe(KLOSET_TINGGI_MANGKUK - TANGKI_Z_MULAI);
    expect(TANGKI_OVERLAP_Z).toBeGreaterThan(0);
  });

  it("keran wastafel didorong sejauh jumlah setengah-lebar konter+keran (formula bersih, bukan tuning visual)", () => {
    expect(WASTAFEL_KERAN_PUSH_IN).toBe(-(22 + 3));
  });
});

describe("pemilihan dinding samping/tiang sudut: konsisten untuk kedua sudut pandang", () => {
  it("dinding kanan dan dinding kiri adalah bayangan cermin satu sama lain terhadap x=W", () => {
    const kanan = footprintDindingKanan();
    const kiri = footprintDindingKiri();
    for (let i = 0; i < kanan.length; i++) {
      // Titik ke-i dinding kanan adalah titik ke-i dinding kiri, dicerminkan: x' = 2W - x (W adalah sisi yang
      // ditempel bersama oleh keduanya), y tetap sama.
      const W2 = kanan[0].x + kiri[0].x; // kanan[0].x = W, kiri[0].x = 0 -> W2 = W
      expect(kanan[i].x + kiri[i].x).toBeCloseTo(W2, 10);
      expect(kanan[i].y).toBe(kiri[i].y);
    }
  });

  it.each(["kiri", "kanan"] as const)("footprintDindingSamping(%s) mengembalikan footprint yang sesuai sisinya", (sudut) => {
    const samping = footprintDindingSamping(sudut);
    if (sudut === "kanan") expect(samping.every((p) => p.x > 0)).toBe(true);
    else expect(samping.every((p) => p.x <= 0)).toBe(true);
  });

  it.each(["kiri", "kanan"] as const)("footprintTiangSudut(%s) selalu di pojok BERLAWANAN dari dinding samping yang solid", (sudut) => {
    const tiang = footprintTiangSudut(sudut);
    const xRataTiang = tiang.reduce((s, p) => s + p.x, 0) / tiang.length;
    // Dinding "kanan" solid -> tiang harus di sisi kiri (x rata-rata <= 0); dinding "kiri" solid -> tiang di kanan (x rata-rata >= W).
    if (sudut === "kanan") expect(xRataTiang).toBeLessThanOrEqual(0);
    else expect(xRataTiang).toBeGreaterThan(0);
  });

  it.each(["kiri", "kanan"] as const)("semua titik footprint dinding samping dan tiang sudut adalah angka finite (%s)", (sudut) => {
    for (const p of [...footprintDindingSamping(sudut), ...footprintTiangSudut(sudut)]) {
      expect(Number.isFinite(p.x)).toBe(true);
      expect(Number.isFinite(p.y)).toBe(true);
    }
  });
});
