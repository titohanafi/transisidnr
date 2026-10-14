import { describe, expect, it } from "vitest";
import { ringkasRp } from "../src/lib/format";

describe("ringkasRp", () => {
  it("menyingkat ribuan menjadi rb dan jutaan menjadi jt", () => {
    expect(ringkasRp("Rp 150.000 - Rp 1.500.000")).toBe("Rp 150 rb - 1,5 jt");
    expect(ringkasRp("Rp 30.000 - Rp 150.000")).toBe("Rp 30 rb - 150 rb");
    expect(ringkasRp("Rp 3.000.000 - Rp 15.000.000")).toBe("Rp 3 jt - 15 jt");
  });

  it("satu angka dan nol", () => {
    expect(ringkasRp("Rp 0")).toBe("Rp 0");
    expect(ringkasRp("Rp 250.000")).toBe("Rp 250 rb");
  });

  it("teks tanpa angka rupiah tidak diubah", () => {
    expect(ringkasRp("Biaya menyusul")).toBe("Biaya menyusul");
  });
});
