import { describe, expect, it } from "vitest";
import { LANTAI_DALAM, LANTAI_LEBAR, posisiTiga } from "../src/domain/isoTigaGeometri";
import type { DindingDenah, LetakDenah } from "../src/domain/pindai";

const DINDING: readonly DindingDenah[] = ["kiri", "kanan", "depan", "belakang"];
const ROTASI_VALID = new Set([0, Math.PI / 2, Math.PI, -Math.PI / 2]);

describe("posisiTiga: invariant posisi/rotasi 3D", () => {
  it.each(DINDING)("menghasilkan x/z finite dan rotasiY salah satu dari 4 nilai valid (dinding %s)", (dinding) => {
    const letak: LetakDenah = { dinding, posisi: "tengah" };
    const p = posisiTiga(letak);
    expect(Number.isFinite(p.x)).toBe(true);
    expect(Number.isFinite(p.z)).toBe(true);
    expect([...ROTASI_VALID].some((r) => Math.abs(r - p.rotasiY) < 1e-9)).toBe(true);
  });

  it("benda di dinding yang berbeda tidak bertumpuk persis di titik yang sama", () => {
    const titikTiap = DINDING.map((dinding) => posisiTiga({ dinding, posisi: "tengah" }));
    for (let i = 0; i < titikTiap.length; i++) {
      for (let j = i + 1; j < titikTiap.length; j++) {
        const jarak = Math.hypot(titikTiap[i].x - titikTiap[j].x, titikTiap[i].z - titikTiap[j].z);
        expect(jarak).toBeGreaterThan(0);
      }
    }
  });

  it("posisi berada dalam batas lantai (dengan toleransi kecil)", () => {
    for (const dinding of DINDING) {
      for (const posisi of ["kiri", "tengah", "kanan", "depan", "belakang"] as const) {
        const p = posisiTiga({ dinding, posisi });
        expect(p.x).toBeGreaterThanOrEqual(-LANTAI_LEBAR / 2 - 0.01);
        expect(p.x).toBeLessThanOrEqual(LANTAI_LEBAR / 2 + 0.01);
        expect(p.z).toBeGreaterThanOrEqual(-LANTAI_DALAM / 2 - 0.01);
        expect(p.z).toBeLessThanOrEqual(LANTAI_DALAM / 2 + 0.01);
      }
    }
  });
});
