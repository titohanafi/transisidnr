import { describe, expect, it } from "vitest";
import { JARAK_BEBAS_BENDA, JARAK_TEPI_DINDING, susunSepanjangDinding } from "../src/domain/tataLetak";

describe("susunSepanjangDinding", () => {
  it("benda yang sudah berjauhan tidak digeser", () => {
    const hasil = susunSepanjangDinding(
      [
        { id: "a", awal: -50, setengah: 20 },
        { id: "b", awal: 50, setengah: 20 },
      ],
      300,
    );
    expect(hasil).toEqual({ a: -50, b: 50 });
  });

  it("dua benda berdekatan didorong menjauh sama besar sampai berjarak bebas", () => {
    const hasil = susunSepanjangDinding(
      [
        { id: "wastafel", awal: -30, setengah: 30 },
        { id: "kloset", awal: 30, setengah: 26 },
      ],
      152.5,
    );
    const jarakTepi = hasil.kloset - 26 - (hasil.wastafel + 30);
    expect(jarakTepi).toBeGreaterThanOrEqual(JARAK_BEBAS_BENDA - 1e-6);
    // Geser sama besar: pusat tengah kedua benda tetap di titik tengah awalnya.
    expect(hasil.wastafel + hasil.kloset).toBeCloseTo(0, 6);
  });

  it("tidak pernah menembus tepi dinding", () => {
    const hasil = susunSepanjangDinding(
      [
        { id: "a", awal: -70, setengah: 30 },
        { id: "b", awal: 70, setengah: 30 },
      ],
      152.5,
    );
    expect(hasil.a - 30).toBeGreaterThanOrEqual(-152.5 / 2 + JARAK_TEPI_DINDING - 1e-6);
    expect(hasil.b + 30).toBeLessThanOrEqual(152.5 / 2 - JARAK_TEPI_DINDING + 1e-6);
  });

  it("urutan awal dipertahankan walau masukan tidak terurut", () => {
    const hasil = susunSepanjangDinding(
      [
        { id: "kanan", awal: 10, setengah: 25 },
        { id: "kiri", awal: -10, setengah: 25 },
      ],
      300,
    );
    expect(hasil.kiri).toBeLessThan(hasil.kanan);
  });
});
