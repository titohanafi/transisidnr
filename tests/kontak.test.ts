import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { KATEGORI_KONTAK } from "../src/domain/konstanta";
import { kategoriUntukKartu, kelompokkanKontak, nomorBersih, urlTelepon, urlWhatsAppKontak } from "../src/domain/kontak";
import { kontakSchema } from "../src/domain/schema";

const asli = JSON.parse(readFileSync(join(__dirname, "..", "content", "kontak.json"), "utf8"));
const kontak = kontakSchema.parse(asli);
const salin = () => structuredClone(asli) as { kategori: { id: string }[]; entri: Record<string, unknown>[] };

describe("skema kontak", () => {
  it("konten asli valid dan setiap kategori punya nama", () => {
    expect(kontak.kategori.map((k) => k.id)).toEqual([...KATEGORI_KONTAK]);
  });

  it("menolak nomor telepon yang bukan nomor", () => {
    const k = salin();
    k.entri[0].telepon = "hubungi kami";
    expect(kontakSchema.safeParse(k).success).toBe(false);
  });

  it("menerima nomor kosong (null) dan nomor dengan spasi atau tanda hubung", () => {
    const k = salin();
    k.entri[0].telepon = null;
    k.entri[1].telepon = "+62 812-3456-7890";
    expect(kontakSchema.safeParse(k).success).toBe(true);
  });

  it("menolak entri yang menunjuk kategori yang tidak ada dan id ganda", () => {
    const a = salin();
    a.entri[0].kategori = "dukun";
    expect(kontakSchema.safeParse(a).success).toBe(false);
    const b = salin();
    b.entri[1].id = b.entri[0].id;
    expect(kontakSchema.safeParse(b).success).toBe(false);
  });
});

describe("sumber kontak", () => {
  it("setiap kontak punya alamat sumber resmi (go.id) dan minimal satu cara dihubungi", () => {
    for (const e of kontak.entri) {
      expect(e.sumber, e.id).not.toBeNull();
      expect(new URL(e.sumber!).hostname, e.id).toMatch(/\.go\.id$/);
      expect(e.telepon ?? e.whatsapp, e.id).not.toBeNull();
    }
  });

  it("nomor WhatsApp memakai awalan internasional (+62) supaya tautan wa.me benar", () => {
    for (const e of kontak.entri.filter((x) => x.whatsapp)) expect(e.whatsapp, e.id).toMatch(/^\+62/);
  });
});

describe("kelompokkanKontak", () => {
  it("mengikuti urutan kategori dan menyertakan kategori tanpa entri", () => {
    const g = kelompokkanKontak(kontak);
    expect(g.map((x) => x.kategori.id)).toEqual([...KATEGORI_KONTAK]);
    expect(g.find((x) => x.kategori.id === "tukang")?.entri).toEqual([]);
    expect(g[0].entri.length).toBeGreaterThan(0);
  });

  it("kategori yang diutamakan tampil lebih dulu tanpa menghilangkan yang lain", () => {
    const g = kelompokkanKontak(kontak, ["tukang", "arsitek"]);
    expect(g.slice(0, 2).map((x) => x.kategori.id)).toEqual(["tukang", "arsitek"]);
    expect(g).toHaveLength(KATEGORI_KONTAK.length);
  });
});

describe("kategoriUntukKartu", () => {
  it("mengambil jenis bantuan sebuah panduan sesuai urutan kategori", () => {
    expect(
      kategoriUntukKartu({
        bantuan: [
          { jenis: "tukang", keterangan: "x" },
          { jenis: "okupasi_terapis", keterangan: "y" },
        ],
      }),
    ).toEqual(["okupasi_terapis", "tukang"]);
    expect(kategoriUntukKartu({ bantuan: undefined })).toEqual([]);
  });
});

describe("tautan kontak", () => {
  it("membersihkan nomor untuk tel: dan wa.me", () => {
    expect(nomorBersih("+62 812-3456-7890")).toBe("+628123456789" + "0");
    expect(urlTelepon("0812 3456")).toBe("tel:08123456");
    expect(urlWhatsAppKontak("+62 812-3456")).toBe("https://wa.me/628123456");
    expect(urlTelepon("112")).toBe("tel:112");
  });
});
