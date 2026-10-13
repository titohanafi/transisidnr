import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { aksiKartu, aksiUntukFilter, cocokFilter, kelompokkan, kumpulkanAhli, kumpulkanAlat } from "../src/domain/jelajah";
import { validasiKonten } from "../src/domain/validasi";
import { TINGKAT } from "../src/domain/konstanta";

const root = join(__dirname, "..", "content");
const baca = (p: string): unknown => JSON.parse(readFileSync(join(root, p), "utf8"));
const k = validasiKonten({
  kartu: readdirSync(join(root, "kartu")).map((f) => baca(join("kartu", f))),
  asesmen: baca("asesmen.json"), config: baca("config.json"), onboarding: baca("onboarding.json"), ui: baca("ui.json"),
});
const kartu = (id: string) => k.kartu.find((x) => x.id === id)!;
const semua = [...TINGKAT];
// Kartu kerangka sintetis, supaya tes tidak bergantung pada kartu mana yang masih kerangka di content/.
const kerangka = (id = "kerangka-uji") => ({ ...structuredClone(kartu("bath-door")), id, isi_menyusul: true as const, solusi: undefined, bantuan: undefined });

describe("aksi langsung dari kartu", () => {
  it("kartu lengkap: sendiri, beli, tukang memakai tingkat teringan yang mendukung, plus ahli", () => {
    expect(aksiKartu(kartu("bath-transfer-toilet"), semua)).toEqual([
      { jenis: "sendiri", tingkat: "tanpa_biaya" },
      { jenis: "beli", tingkat: "alat_tanpa_bongkar" },
      { jenis: "tukang", tingkat: "alat_tanpa_bongkar" },
      { jenis: "ahli" },
    ]);
  });
  it("tingkat yang tersembunyi tidak dipakai (renovasi disembunyikan, alat tetap)", () => {
    const a = aksiKartu(kartu("bath-transfer-toilet"), ["tanpa_biaya", "alat_tanpa_bongkar"]);
    expect(a.every((x) => x.tingkat !== "renovasi")).toBe(true);
    expect(a.map((x) => x.jenis)).toContain("tukang");
  });
  it("bila hanya tingkat tanpa biaya tampil, tidak ada beli atau tukang", () => {
    expect(aksiKartu(kartu("bath-transfer-toilet"), ["tanpa_biaya"]).map((x) => x.jenis)).toEqual(["sendiri", "ahli"]);
  });
  it("kartu pendamping: sendiri dan ahli", () => {
    expect(aksiKartu(kartu("care-assist-transfer"), semua).map((x) => x.jenis)).toEqual(["sendiri", "ahli"]);
  });
  it("kartu kerangka tidak punya aksi", () => {
    expect(aksiKartu(kerangka(), semua)).toEqual([]);
  });
});

describe("filter", () => {
  it("semua menampilkan semua kartu, termasuk kerangka", () => {
    expect(k.kartu.every((c) => cocokFilter(c, semua, "semua"))).toBe(true);
  });
  it.each(["alat", "tukang", "ahli"] as const)("%s tidak menyertakan kartu kerangka", (f) => {
    expect(cocokFilter(kerangka(), semua, f)).toBe(false);
  });
  it("alat dan tukang hanya kartu yang punya barang atau tingkat tukang", () => {
    const alat = k.kartu.filter((c) => cocokFilter(c, semua, "alat"));
    expect(alat.length).toBeGreaterThan(0);
    expect(alat.every((c) => aksiKartu(c, semua).some((a) => a.jenis === "beli"))).toBe(true);
    expect(k.kartu.some((c) => c.id === "care-assist-transfer" && cocokFilter(c, semua, "alat"))).toBe(false);
  });
  it("ahli: kartu yang punya bantuan, termasuk pendamping", () => {
    const ids = k.kartu.filter((c) => cocokFilter(c, semua, "ahli")).map((c) => c.id);
    expect(ids).toContain("bath-transfer-toilet");
    expect(ids).toContain("care-assist-transfer");
  });
});

describe("aksi di daftar", () => {
  const aksi = aksiKartu(kartu("bath-transfer-toilet"), semua);
  it("tanpa filter tidak ada tombol aksi (cukup buka panduan)", () => {
    expect(aksiUntukFilter(aksi, "semua")).toEqual([]);
  });
  it.each([["alat", "beli"], ["tukang", "tukang"], ["ahli", "ahli"]] as const)("filter %s hanya menampilkan aksi %s", (f, jenis) => {
    expect(aksiUntukFilter(aksi, f).map((a) => a.jenis)).toEqual([jenis]);
  });
  it("lakukan sendiri tidak pernah ditampilkan di daftar", () => {
    for (const f of ["semua", "alat", "tukang", "ahli"] as const) expect(aksiUntukFilter(aksi, f).some((a) => a.jenis === "sendiri")).toBe(false);
  });
});

describe("pengelompokan", () => {
  const g = kelompokkan(k.kartu, k.asesmen.aktivitas.map((a) => a.id));
  it("mengikuti urutan aktivitas asesmen, pendamping di akhir, tanpa kelompok kosong", () => {
    expect(g.map((x) => x.kunci)).toEqual(["mandi", "toilet", "wudhu", "grooming", "umum", "caregiver"]);
  });
  it("setiap kartu muncul tepat satu kali", () => {
    const ids = g.flatMap((x) => x.kartu.map((c) => c.id));
    expect(ids.sort()).toEqual(k.kartu.map((c) => c.id).sort());
  });
  it("dalam kelompok, kartu berisi lebih dulu daripada kerangka", () => {
    const k2 = [...k.kartu, { ...kerangka("a-kerangka"), tag: { ...kartu("bath-grab-bar").tag } }];
    const toilet = kelompokkan(k2, k.asesmen.aktivitas.map((a) => a.id)).find((x) => x.kunci === "toilet")!;
    expect(toilet.kartu.at(-1)!.id).toBe("a-kerangka");
    expect(toilet.kartu.slice(0, -1).every((c) => !c.isi_menyusul)).toBe(true);
  });
  it("urutan tidak bergantung pada link atau afiliasi", () => {
    const salinan = structuredClone(k.kartu);
    for (const c of salinan) for (const t of TINGKAT) for (const b of c.solusi?.[t]?.barang ?? []) { b.afiliasi = true; b.link = "https://x.example"; }
    const g2 = kelompokkan(salinan, k.asesmen.aktivitas.map((a) => a.id));
    expect(g2.map((x) => x.kartu.map((c) => c.id))).toEqual(g.map((x) => x.kartu.map((c) => c.id)));
  });
});

describe("daftar alat dan ahli", () => {
  const tampilSemua = () => semua;
  it("alat digabung menurut nama dan mencatat panduan asalnya", () => {
    const alat = kumpulkanAlat(k.kartu, tampilSemua);
    const nama = alat.map((a) => a.nama.toLowerCase());
    expect(new Set(nama).size).toBe(nama.length);
    expect(alat.every((a) => a.panduan.length > 0)).toBe(true);
    expect(alat.find((a) => a.nama === "Papan pindah")?.panduan.length).toBeGreaterThan(1);
  });
  it("tingkat yang tersembunyi tidak ikut (renovasi disembunyikan)", () => {
    const tanpaRenovasi = kumpulkanAlat(k.kartu, () => ["tanpa_biaya", "alat_tanpa_bongkar"]);
    expect(tanpaRenovasi.flatMap((a) => a.panduan).every((p) => p.tingkat !== "renovasi")).toBe(true);
  });
  it("kartu kerangka tidak menyumbang alat", () => {
    expect(kumpulkanAlat([kerangka()], tampilSemua)).toEqual([]);
  });
  it("urutan alat tidak berubah oleh tautan atau afiliasi", () => {
    const salinan = structuredClone(k.kartu);
    for (const c of salinan) for (const t of TINGKAT) for (const b of c.solusi?.[t]?.barang ?? []) { b.afiliasi = true; b.link = "https://x.example"; }
    expect(kumpulkanAlat(salinan, tampilSemua).map((a) => a.nama)).toEqual(kumpulkanAlat(k.kartu, tampilSemua).map((a) => a.nama));
  });
  it("ahli: tukang tidak dihitung, tiap jenis punya panduan", () => {
    const ahli = kumpulkanAhli(k.kartu);
    expect(ahli.map((a) => a.jenis)).not.toContain("tukang");
    expect(ahli.map((a) => a.jenis)).toContain("okupasi_terapis");
    expect(ahli.every((a) => a.panduan.length > 0)).toBe(true);
  });
});
