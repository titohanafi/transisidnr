import { describe, expect, it } from "vitest";
import { DIM } from "../src/domain/dimensiGambar";
import { H, W } from "../src/domain/denahGeometri";
import type { LetakDenah, ObjekDenah } from "../src/domain/pindai";
import { JARAK_BEBAS_BENDA, JARAK_TEPI_DINDING, susunSepanjangDinding, titikTertata } from "../src/domain/tataLetak";

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

  it("dua benda berdekatan di dinding lebar didorong menjauh sama besar sampai berjarak bebas", () => {
    const hasil = susunSepanjangDinding(
      [
        { id: "wastafel", awal: -30, setengah: 30 },
        { id: "kloset", awal: 30, setengah: 26 },
      ],
      400,
    );
    const jarakTepi = hasil.kloset - 26 - (hasil.wastafel + 30);
    expect(jarakTepi).toBeCloseTo(JARAK_BEBAS_BENDA, 6);
    // Geser sama besar: titik tengah kedua benda tetap di tempat semula.
    expect(hasil.wastafel + hasil.kloset).toBeCloseTo(0, 6);
  });

  it("di ruang minimum PerMen (152,5 cm) wastafel dan kloset masih berjarak bebas dan di dalam dinding", () => {
    const hasil = susunSepanjangDinding(
      [
        { id: "wastafel", awal: -30, setengah: 30 },
        { id: "kloset", awal: 30, setengah: 26 },
      ],
      152.5,
    );
    expect(hasil.kloset - 26 - (hasil.wastafel + 30)).toBeGreaterThanOrEqual(JARAK_BEBAS_BENDA - 0.5);
    expect(hasil.wastafel - 30).toBeGreaterThanOrEqual(-152.5 / 2 + JARAK_TEPI_DINDING - 1e-6);
    expect(hasil.kloset + 26).toBeLessThanOrEqual(152.5 / 2 - JARAK_TEPI_DINDING + 1e-6);
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

describe("titikTertata (tampak atas)", () => {
  const letak = (id: ObjekDenah): LetakDenah =>
    ({
      pintu: { dinding: "depan", posisi: "kiri" },
      wastafel: { dinding: "belakang", posisi: "kiri" },
      kloset: { dinding: "belakang", posisi: "tengah" },
      area_mandi: { dinding: "kanan", posisi: "tengah" },
    })[id] as LetakDenah;

  it("wastafel dan kloset di dinding belakang tidak saling menimpa walau zonanya berdekatan, dan urutannya terjaga", () => {
    const t = titikTertata(letak);
    const jarakCm = ((t.kloset.x - t.wastafel.x) / W) * DIM.ruang.lebar;
    expect(t.wastafel.x).toBeLessThan(t.kloset.x);
    // Pusat berjarak minimal setengah lebar wastafel + setengah lebar kloset + jarak bebas.
    expect(jarakCm).toBeGreaterThanOrEqual(DIM.wastafel.lebarBak / 2 + 26 + JARAK_BEBAS_BENDA - 1);
  });

  it("koordinat tegak lurus dinding tidak berubah, dan benda tunggal di dinding hampir tidak bergeser", () => {
    const t = titikTertata(letak);
    expect(t.wastafel.y).toBeCloseTo(t.kloset.y, 6);
    expect(t.area_mandi.y).toBeGreaterThan(0);
    expect(t.area_mandi.y).toBeLessThan(H);
    expect(t.pintu.x).toBeGreaterThan(0);
  });
});
