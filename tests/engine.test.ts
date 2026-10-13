import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { bacaKisaranRp, buatRencana, type Masukan } from "../src/domain/engine";
import { validasiKonten } from "../src/domain/validasi";
import type { Aktivitas, Asesmen, Config, Kartu, TingkatSolusi } from "../src/domain/schema";

const config: Config = {
  ruangan: [{ id: "kamar_mandi", nama: "Kamar mandi", tersedia: true }],
  faseAwalBulan: 3,
  maksMulaiDariSini: 3,
  budget: [
    { id: "kecil", label: "kecil", minRp: 0, maksRp: 500_000 },
    { id: "besar", label: "besar", minRp: 10_000_000, maksRp: null },
    { id: "belum_tahu", label: "belum", minRp: null, maksRp: null },
  ],
};

const tag = (aktivitas: Aktivitas): Kartu["tag"] => ({
  fase: [], ruangan: ["kamar_mandi"], aktivitas: [aktivitas], alat_bantu: ["kursi_roda"],
  hunian: ["milik_sendiri"], tingkat_biaya: [], kondisi: [],
});

const tingkat = (sifat: "sementara" | "permanen", kisaran: string | null, langkah: string): TingkatSolusi => ({
  ringkasan: "r", langkah: [langkah, "langkah kedua"], sifat,
  biaya: { kisaran_rp: kisaran }, usaha: { waktu: null, kesulitan: null }, barang: [],
});

function kartu(id: string, akt: Aktivitas, solusi: Kartu["solusi"], extra: Partial<Kartu> = {}): Kartu {
  return { id, judul: id, situasi: "s", tag: tag(akt), status_validasi: "draf", solusi, ...extra };
}

const lengkap = (id: string, akt: Aktivitas, kisaran: string | null = "Rp 0") =>
  kartu(id, akt, {
    tanpa_biaya: tingkat("sementara", kisaran, `${id}: langkah tanpa biaya`),
    alat_tanpa_bongkar: tingkat("sementara", null, "alat"),
    renovasi: tingkat("permanen", null, "renovasi"),
  });

const pendamping = kartu("pendamping", "toilet", { tanpa_biaya: tingkat("sementara", "Rp 0", "tanya dulu") }, {
  tag: { ...tag("toilet"), peran: ["caregiver"] },
});

const soal = (id: string, aktivitas: Aktivitas, kartuId: string[]) => ({
  id, aktivitas, pertanyaan: "?", penjelasan: "p", memicu_kartu: kartuId,
});

const asesmen: Asesmen = {
  aktivitas: [],
  pertanyaan: [
    soal("q-a", "mandi", ["a"]),
    soal("q-b", "toilet", ["b"]),
    soal("q-c", "wudhu", ["c"]),
    soal("q-d", "grooming", ["d"]),
    soal("q-e", "umum", ["e"]),
  ],
};

const semuaKartu = [
  lengkap("a", "mandi"), lengkap("b", "toilet"), lengkap("c", "wudhu"),
  lengkap("d", "grooming"), lengkap("e", "umum"), pendamping,
];

// Kebutuhan jangka panjang sudah jelas, milik sendiri, tidak ada budget.
const dasar: Masukan = {
  hunian: "milik_sendiri", protesis: "tidak", kejadianBulanMaks: null, budget: null,
  statusAktivitas: {}, prioritas: [], jawaban: {},
};
const ya = (...ids: string[]) => Object.fromEntries(ids.map((i) => [i, true]));
const buat = (m: Partial<Masukan>, k = semuaKartu) => buatRencana({ ...dasar, ...m }, k, asesmen, config);
const ids = (r: { id: string }[]) => r.map((x) => x.id);

describe("aturan 1: prioritas tampil lebih dulu", () => {
  it("prioritas mengubah urutan", () => {
    const j = ya("q-a", "q-b", "q-c");
    expect(ids(buat({ jawaban: j, prioritas: [] }).daftar)).toEqual(["a", "b", "c"]);
    expect(ids(buat({ jawaban: j, prioritas: ["wudhu"] }).daftar)).toEqual(["c", "a", "b"]);
    expect(ids(buat({ jawaban: j, prioritas: ["toilet", "wudhu"] }).daftar)).toEqual(["b", "c", "a"]);
  });
  it("menandai kartu prioritas", () => {
    const r = buat({ jawaban: ya("q-a", "q-b"), prioritas: ["toilet"] });
    expect(r.daftar.map((k) => k.prioritas)).toEqual([true, false]);
  });
});

describe("aturan 2: urutan tingkat", () => {
  it("tanpa_biaya, alat_tanpa_bongkar, renovasi", () => {
    const r = buat({ jawaban: ya("q-a") });
    expect(r.daftar[0].tingkat.map((t) => t.tingkat)).toEqual(["tanpa_biaya", "alat_tanpa_bongkar", "renovasi"]);
  });
  it("tetap berurutan walau data kartu menulis urutan lain", () => {
    const k = kartu("a", "mandi", {
      renovasi: tingkat("permanen", null, "x"),
      tanpa_biaya: tingkat("sementara", "Rp 0", "y"),
    });
    const r = buat({ jawaban: ya("q-a") }, [k]);
    expect(r.daftar[0].tingkat.map((t) => t.tingkat)).toEqual(["tanpa_biaya", "renovasi"]);
  });
});

describe("aturan 3: kontrakan dan kos", () => {
  it.each(["kontrakan", "kos"])("%s menyembunyikan renovasi dan menonjolkan alat", (hunian) => {
    const t = buat({ hunian, jawaban: ya("q-a") }).daftar[0].tingkat;
    const reno = t.find((x) => x.tingkat === "renovasi")!;
    expect(reno.disembunyikanHunian).toBe(true);
    expect(reno.tampil).toBe(false);
    expect(t.find((x) => x.tingkat === "alat_tanpa_bongkar")!.ditonjolkan).toBe(true);
    expect(t.find((x) => x.tingkat === "tanpa_biaya")!.tampil).toBe(true);
  });
  it("milik sendiri tidak menyembunyikan apa pun", () => {
    const t = buat({ jawaban: ya("q-a") }).daftar[0].tingkat;
    expect(t.every((x) => x.tampil && !x.disembunyikanHunian && !x.ditonjolkan)).toBe(true);
  });
  it("kartu yang hanya punya tingkat permanen tidak masuk mulaiDariSini di kontrakan", () => {
    const hanyaReno = kartu("a", "mandi", { renovasi: tingkat("permanen", null, "x") });
    const r = buat({ hunian: "kontrakan", jawaban: ya("q-a") }, [hanyaReno]);
    expect(ids(r.daftar)).toEqual(["a"]);
    expect(r.mulaiDariSini).toEqual([]);
  });
});

describe("aturan 4: kebutuhan jangka panjang belum jelas", () => {
  const hanyaReno = kartu("a", "mandi", { renovasi: tingkat("permanen", null, "x") });
  const campur = lengkap("b", "toilet");

  it.each([
    ["kejadian ≤ faseAwalBulan", { kejadianBulanMaks: 3 }],
    ["kejadian kurang dari 1 bulan", { kejadianBulanMaks: 1 }],
    ["protesis ya", { protesis: "ya" as const }],
    ["protesis belum tahu", { protesis: "belum_tahu" as const }],
    ["protesis belum dijawab", { protesis: null }],
  ])("fase awal (%s): kartu permanen tidak masuk mulaiDariSini", (_n, m) => {
    const r = buat({ ...m, jawaban: ya("q-a", "q-b") }, [hanyaReno, campur]);
    expect(r.kebutuhanJangkaPanjangBelumJelas).toBe(true);
    expect(ids(r.daftar)).toEqual(["a", "b"]);
    expect(ids(r.mulaiDariSini)).toEqual(["b"]);
  });

  it("tingkat permanen diberi penanda tunggu dulu", () => {
    const t = buat({ protesis: "ya", jawaban: ya("q-b") }).daftar[0].tingkat;
    expect(t.find((x) => x.tingkat === "renovasi")!.ditandaiPermanen).toBe(true);
    expect(t.find((x) => x.tingkat === "tanpa_biaya")!.ditandaiPermanen).toBe(false);
  });

  it("bila sudah jelas (>3 bulan, tanpa protesis), kartu permanen boleh masuk", () => {
    const r = buat({ kejadianBulanMaks: 6, jawaban: ya("q-a") }, [hanyaReno]);
    expect(r.kebutuhanJangkaPanjangBelumJelas).toBe(false);
    expect(ids(r.mulaiDariSini)).toEqual(["a"]);
    expect(r.daftar[0].tingkat[0].ditandaiPermanen).toBe(false);
  });
});

describe("aturan 5: mulaiDariSini maksimal 3", () => {
  it("mengambil tiga teratas", () => {
    const r = buat({ jawaban: ya("q-a", "q-b", "q-c", "q-d", "q-e") });
    expect(r.daftar).toHaveLength(5);
    expect(ids(r.mulaiDariSini)).toEqual(["a", "b", "c"]);
  });
  it("mengikuti config.maksMulaiDariSini", () => {
    const r = buatRencana({ ...dasar, jawaban: ya("q-a", "q-b", "q-c") }, semuaKartu, asesmen, { ...config, maksMulaiDariSini: 1 });
    expect(ids(r.mulaiDariSini)).toEqual(["a"]);
  });
  it("melewati kartu yang tidak lolos dan mengambil berikutnya", () => {
    const hanyaReno = kartu("a", "mandi", { renovasi: tingkat("permanen", null, "x") });
    const k = [hanyaReno, lengkap("b", "toilet"), lengkap("c", "wudhu"), lengkap("d", "grooming"), lengkap("e", "umum")];
    const r = buat({ hunian: "kos", jawaban: ya("q-a", "q-b", "q-c", "q-d", "q-e") }, k);
    expect(ids(r.mulaiDariSini)).toEqual(["b", "c", "d"]);
  });
});

describe("aturan 6: pendamping dan check-in selalu ada", () => {
  it("pendamping paling akhir", () => {
    const r = buat({ jawaban: ya("q-a", "q-b") });
    expect(r.pendamping).toBe("pendamping");
    expect(r.urutanTampil).toEqual(["a", "b", "pendamping"]);
    expect(r.tampilkanCheckin).toBe(true);
  });
  it("pendamping tidak ikut masuk daftar walau dipicu asesmen", () => {
    const a2: Asesmen = { ...asesmen, pertanyaan: [soal("q-p", "toilet", ["pendamping", "a"])] };
    const r = buatRencana({ ...dasar, jawaban: ya("q-p") }, semuaKartu, a2, config);
    expect(ids(r.daftar)).toEqual(["a"]);
  });
  it("tetap ada tanpa jawaban ya", () => {
    const r = buat({ jawaban: { "q-a": false } });
    expect(r.pendamping).toBe("pendamping");
    expect(r.urutanTampil).toEqual(["pendamping"]);
    expect(r.tampilkanCheckin).toBe(true);
  });
});

describe("aturan 7: budget", () => {
  const k = [kartu("a", "mandi", { tanpa_biaya: tingkat("sementara", "Rp 600 ribu", "x") })];
  it("tidak memfilter apa pun", () => {
    const j = ya("q-a");
    expect(ids(buat({ budget: "kecil", jawaban: j }, k).daftar)).toEqual(ids(buat({ budget: "besar", jawaban: j }, k).daftar));
    expect(ids(buat({ budget: "kecil", jawaban: j }, k).mulaiDariSini)).toEqual(["a"]);
  });
  it("catatan di atas budget bila kisaran diketahui", () => {
    expect(buat({ budget: "kecil", jawaban: ya("q-a") }, k).daftar[0].tingkat[0].diAtasBudget).toBe(true);
    expect(buat({ budget: "besar", jawaban: ya("q-a") }, k).daftar[0].tingkat[0].diAtasBudget).toBe(false);
  });
  it("tanpa catatan bila kisaran null atau budget belum tahu", () => {
    const nol = [kartu("a", "mandi", { tanpa_biaya: tingkat("sementara", null, "x") })];
    expect(buat({ budget: "kecil", jawaban: ya("q-a") }, nol).daftar[0].tingkat[0].diAtasBudget).toBe(false);
    expect(buat({ budget: "belum_tahu", jawaban: ya("q-a") }, k).daftar[0].tingkat[0].diAtasBudget).toBe(false);
    expect(buat({ budget: null, jawaban: ya("q-a") }, k).daftar[0].tingkat[0].diAtasBudget).toBe(false);
  });
});

describe("aturan 8: satu hal untuk hari ini", () => {
  it("langkah pertama tingkat pertama kartu pertama di mulaiDariSini", () => {
    const r = buat({ jawaban: ya("q-b", "q-a"), prioritas: ["toilet"] });
    expect(r.satuHalHariIni).toEqual({ kartuId: "b", tingkat: "tanpa_biaya", langkah: "b: langkah tanpa biaya" });
  });
  it("null bila mulaiDariSini kosong", () => {
    expect(buat({}).satuHalHariIni).toBeNull();
  });
});

describe("aturan 9: tanpa jawaban ya", () => {
  it("keadaan kosong, tetap ada pendamping", () => {
    const r = buat({ jawaban: { "q-a": false, "q-b": false } });
    expect(r.kosong).toBe(true);
    expect(r.daftar).toEqual([]);
    expect(r.mulaiDariSini).toEqual([]);
    expect(r.satuHalHariIni).toBeNull();
    expect(r.pendamping).toBe("pendamping");
  });
  it("tanpa jawaban sama sekali juga kosong", () => {
    expect(buat({}).kosong).toBe(true);
  });
});

describe("kartu kerangka (isi menyusul)", () => {
  const kerangka = kartu("a", "mandi", undefined, { isi_menyusul: true });
  it("masuk daftar tetapi tidak masuk mulaiDariSini", () => {
    const r = buat({ jawaban: ya("q-a", "q-b") }, [kerangka, lengkap("b", "toilet")]);
    expect(ids(r.daftar)).toEqual(["a", "b"]);
    expect(r.daftar[0].isiMenyusul).toBe(true);
    expect(ids(r.mulaiDariSini)).toEqual(["b"]);
  });
});

describe("total biaya", () => {
  it("dijumlah bila semua kisaran diketahui", () => {
    const k = [
      kartu("a", "mandi", { tanpa_biaya: tingkat("sementara", "Rp 0", "x") }),
      kartu("b", "toilet", { tanpa_biaya: tingkat("sementara", "Rp 50 ribu - 100 ribu", "x") }),
    ];
    expect(buat({ jawaban: ya("q-a", "q-b") }, k).total).toEqual({ diketahui: true, minRp: 50_000, maksRp: 100_000 });
  });
  it("tidak diketahui bila ada satu saja yang null", () => {
    const k = [
      kartu("a", "mandi", { tanpa_biaya: tingkat("sementara", "Rp 0", "x") }),
      kartu("b", "toilet", { tanpa_biaya: tingkat("sementara", null, "x") }),
    ];
    expect(buat({ jawaban: ya("q-a", "q-b") }, k).total).toEqual({ diketahui: false });
  });
  it("tidak diketahui bila daftar kosong atau ada kartu kerangka", () => {
    expect(buat({}).total).toEqual({ diketahui: false });
    const r = buat({ jawaban: ya("q-a") }, [kartu("a", "mandi", undefined, { isi_menyusul: true })]);
    expect(r.total).toEqual({ diketahui: false });
  });
});

describe("bacaKisaranRp", () => {
  it.each([
    ["Rp 0", { min: 0, max: 0 }],
    ["Rp 500.000", { min: 500_000, max: 500_000 }],
    ["Rp 500 ribu - 2 juta", { min: 500_000, max: 2_000_000 }],
    ["Rp 2,5 juta", { min: 2_500_000, max: 2_500_000 }],
  ])("%s", (teks, hasil) => expect(bacaKisaranRp(teks)).toEqual(hasil));
  it.each([null, "", "menyusul"])("null untuk %s", (t) => expect(bacaKisaranRp(t)).toBeNull());
});

describe("fungsi murni", () => {
  it("tidak mengubah masukan dan hasilnya sama setiap kali", () => {
    const m: Masukan = { ...dasar, jawaban: ya("q-a", "q-b"), prioritas: ["toilet"] };
    const salinan = structuredClone({ m, semuaKartu });
    const r1 = buatRencana(m, semuaKartu, asesmen, config);
    const r2 = buatRencana(m, semuaKartu, asesmen, config);
    expect(r1).toEqual(r2);
    expect({ m, semuaKartu }).toEqual(salinan);
  });
});

describe("dengan konten asli", () => {
  const root = join(__dirname, "..", "content");
  const baca = (p: string): unknown => JSON.parse(readFileSync(join(root, p), "utf8"));
  const k = validasiKonten({
    kartu: readdirSync(join(root, "kartu")).map((f) => baca(join("kartu", f))),
    asesmen: baca("asesmen.json"), config: baca("config.json"),
    onboarding: baca("onboarding.json"), ui: baca("ui.json"),
  });

  it("pindah ke kloset memicu kartu yang bersangkutan, kartu pertama jadi Mulai dari sini", () => {
    const r = buatRencana(
      { ...dasar, prioritas: ["toilet"], jawaban: ya("q-toilet-pindah", "q-toilet-pegangan", "q-toilet-ruang") },
      k.kartu, k.asesmen, k.config,
    );
    expect(ids(r.daftar)).toEqual(["bath-transfer-toilet", "bath-grab-bar", "bath-space-turning"]);
    expect(ids(r.mulaiDariSini)[0]).toBe("bath-transfer-toilet");
    expect(r.mulaiDariSini.length).toBeLessThanOrEqual(k.config.maksMulaiDariSini);
    expect(r.satuHalHariIni?.langkah).toBe("Kosongkan area di samping kloset agar ada ruang untuk berpindah.");
    expect(r.pendamping).toBe("care-assist-transfer");
    expect(r.total).toMatchObject({ diketahui: true, minRp: 0 }); // semua tingkat awal bertanda "Rp 0"
  });

  it("tanpa jawaban ya: kosong dengan pendamping", () => {
    const r = buatRencana(dasar, k.kartu, k.asesmen, k.config);
    expect(r.kosong).toBe(true);
    expect(r.urutanTampil).toEqual(["care-assist-transfer"]);
  });
});
