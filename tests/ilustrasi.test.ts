import { describe, expect, it } from "vitest";
import { KUNCI_GAMBAR } from "../src/components/IlustrasiSolusi";
import { konten } from "../src/domain/content";

describe("ilustrasi solusi", () => {
  const kunci = KUNCI_GAMBAR();
  const kartu = new Map(konten.kartu.map((k) => [k.id, k]));

  it("tiap gambar punya penjelasan, dan tiap penjelasan punya gambar", () => {
    expect(Object.keys(konten.ui.ilustrasi.gambar).sort()).toEqual([...kunci].sort());
    for (const k of kunci) expect(konten.ui.ilustrasi.gambar[k].trim(), k).not.toBe("");
  });

  it("tiap gambar menunjuk pilihan solusi yang ada di kartunya", () => {
    for (const k of kunci) {
      const [id, tingkat] = k.split(":");
      expect(kartu.get(id)?.solusi?.[tingkat as "tanpa_biaya"], k).toBeTruthy();
    }
  });

  it("tiap pilihan solusi punya gambar", () => {
    for (const kt of konten.kartu)
      for (const tingkat of Object.keys(kt.solusi ?? {})) expect(kunci, `${kt.id}:${tingkat}`).toContain(`${kt.id}:${tingkat}`);
  });
});
