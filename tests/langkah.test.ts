import { describe, expect, it } from "vitest";
import { ringkasLangkah, tingkatSetelah, ubahCentang } from "../src/domain/langkah";

describe("ubahCentang", () => {
  it("mencentang langkah baru dan menjaga urutan naik", () => {
    expect(ubahCentang([0, 3], 1)).toEqual([0, 1, 3]);
    expect(ubahCentang([], 2)).toEqual([2]);
  });

  it("melepas langkah yang sudah tercentang", () => {
    expect(ubahCentang([0, 1, 3], 1)).toEqual([0, 3]);
    expect(ubahCentang([2], 2)).toEqual([]);
  });

  it("tidak mengubah daftar asli", () => {
    const asli = [0, 1];
    ubahCentang(asli, 2);
    expect(asli).toEqual([0, 1]);
  });
});

describe("ringkasLangkah", () => {
  it("belum ada centang: tanpa dorongan dan belum selesai", () => {
    expect(ringkasLangkah([], 4)).toEqual({ selesai: [], semuaSelesai: false, dorongan: null });
  });

  it("kurang dari separuh: dorongan 'mulai'", () => {
    expect(ringkasLangkah([0], 4).dorongan).toBe("mulai");
    expect(ringkasLangkah([1], 3).dorongan).toBe("mulai");
  });

  it("separuh atau lebih tetapi belum semua: dorongan 'separuh'", () => {
    expect(ringkasLangkah([0, 1], 4).dorongan).toBe("separuh");
    expect(ringkasLangkah([0, 1, 2], 4).dorongan).toBe("separuh");
    expect(ringkasLangkah([0, 1], 3).dorongan).toBe("separuh");
  });

  it("semua tercentang: selesai", () => {
    const r = ringkasLangkah([0, 1, 2], 3);
    expect(r.semuaSelesai).toBe(true);
    expect(r.dorongan).toBe("selesai");
  });

  it("centang usang (nomor di luar daftar) diabaikan, sehingga tidak dihitung selesai", () => {
    const r = ringkasLangkah([0, 1, 5, 9], 3);
    expect(r.selesai).toEqual([0, 1]);
    expect(r.semuaSelesai).toBe(false);
  });

  it("nomor ganda dan tidak valid diabaikan", () => {
    expect(ringkasLangkah([1, 1, 1], 3).selesai).toEqual([1]);
    expect(ringkasLangkah([-1, 0.5, 2], 3).selesai).toEqual([2]);
  });

  it("daftar langkah kosong tidak pernah dianggap selesai", () => {
    expect(ringkasLangkah([], 0).semuaSelesai).toBe(false);
    expect(ringkasLangkah([0], 0).selesai).toEqual([]);
  });
});

describe("tingkatSetelah", () => {
  const isi = {
    ringkasan: "x",
    sifat: "sementara",
    langkah: ["a"],
    biaya: { kisaran_rp: null },
    usaha: { waktu: null, kesulitan: null },
    barang: [],
  };
  const kartu = (tingkat: string[]) =>
    ({ solusi: Object.fromEntries(tingkat.map((t) => [t, isi])) }) as unknown as Parameters<typeof tingkatSetelah>[0];

  it("memberi tingkat berikutnya yang ada isinya", () => {
    expect(tingkatSetelah(kartu(["tanpa_biaya", "alat_tanpa_bongkar", "renovasi"]), "tanpa_biaya")).toBe("alat_tanpa_bongkar");
    expect(tingkatSetelah(kartu(["tanpa_biaya", "alat_tanpa_bongkar", "renovasi"]), "alat_tanpa_bongkar")).toBe("renovasi");
  });

  it("melompati tingkat yang tidak ada", () => {
    expect(tingkatSetelah(kartu(["tanpa_biaya", "renovasi"]), "tanpa_biaya")).toBe("renovasi");
  });

  it("undefined bila sudah tingkat terakhir atau tidak ada solusi", () => {
    expect(tingkatSetelah(kartu(["tanpa_biaya"]), "tanpa_biaya")).toBeUndefined();
    expect(tingkatSetelah(kartu(["tanpa_biaya", "alat_tanpa_bongkar", "renovasi"]), "renovasi")).toBeUndefined();
    expect(tingkatSetelah({ solusi: undefined }, "tanpa_biaya")).toBeUndefined();
  });
});
