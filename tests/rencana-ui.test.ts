import { describe, expect, it } from "vitest";
import { istilahDalam } from "../src/domain/istilah";
import { bolehTampilkanUkuran } from "../src/domain/ukuran";
import { formatRentang, formatRp } from "../src/lib/format";
import { keMasukan } from "../src/state/masukan";
import { parseState, stateAwal } from "../src/state/storage";
import { buatRencana } from "../src/domain/engine";
import { validasiKonten } from "../src/domain/validasi";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(__dirname, "..", "content");
const baca = (p: string): unknown => JSON.parse(readFileSync(join(root, p), "utf8"));
const k = validasiKonten({
  kartu: readdirSync(join(root, "kartu")).map((f) => baca(join("kartu", f))),
  asesmen: baca("asesmen.json"),
  config: baca("config.json"),
  onboarding: baca("onboarding.json"),
  ui: baca("ui.json"),
});

describe("keMasukan", () => {
  it("jawaban kosong -> null semua (aman: kebutuhan jangka panjang dianggap belum jelas)", () => {
    const m = keMasukan(stateAwal(), k.onboarding);
    expect(m).toMatchObject({ hunian: null, protesis: null, kejadianBulanMaks: null, budget: null, prioritas: [], jawaban: {} });
  });
  it("memetakan jawaban onboarding dan asesmen", () => {
    const s = {
      ...stateAwal(),
      onboarding: { hunian: ["kos"], protesis: ["tidak"], kejadian: ["1_3_bulan"], budget: ["500rb_2jt"] },
      asesmen: { status: { toilet: "sulit" as const }, prioritas: ["toilet" as const], jawaban: { "q-toilet-pindah": true } },
    };
    expect(keMasukan(s, k.onboarding)).toEqual({
      hunian: "kos",
      protesis: "tidak",
      kejadianBulanMaks: 3,
      budget: "500rb_2jt",
      statusAktivitas: { toilet: "sulit" },
      prioritas: ["toilet"],
      jawaban: { "q-toilet-pindah": true },
    });
  });
  it("'lebih dari 6 bulan' -> null; protesis tak dikenal -> null", () => {
    const s = { ...stateAwal(), onboarding: { kejadian: ["lebih_6_bulan"], protesis: ["aneh"] } };
    const m = keMasukan(s, k.onboarding);
    expect(m.kejadianBulanMaks).toBeNull();
    expect(m.protesis).toBeNull();
  });
  it("end-to-end dengan konten asli: kontrakan + fase awal", () => {
    const s = {
      ...stateAwal(),
      onboarding: { hunian: ["kontrakan"], protesis: ["belum_tahu"], kejadian: ["kurang_1_bulan"] },
      asesmen: { status: { toilet: "sulit" as const }, prioritas: ["toilet" as const], jawaban: { "q-toilet-pindah": true } },
    };
    const r = buatRencana(keMasukan(s, k.onboarding), k.kartu, k.asesmen, k.config);
    const kartu = r.daftar[0];
    expect(kartu.id).toBe("bath-transfer-toilet");
    expect(kartu.tingkat.map((t) => t.tingkat)).toEqual(["tanpa_biaya", "alat_tanpa_bongkar", "renovasi"]);
    expect(kartu.tingkat[2]).toMatchObject({ tampil: false, disembunyikanHunian: true, ditandaiPermanen: true });
    expect(kartu.tingkat[1].ditonjolkan).toBe(true);
    expect(r.mulaiDariSini.map((x) => x.id)).toEqual(["bath-transfer-toilet"]);
  });
});

describe("check-in tersimpan", () => {
  it("state lama tanpa checkin tetap valid dengan null", () => {
    expect(parseState({ versi: 1, onboarding: {} })?.checkin).toBeNull();
  });
});

describe("angka teknis kartu draf", () => {
  it("tersembunyi untuk draf kecuali flag dev", () => {
    expect(bolehTampilkanUkuran("draf", false)).toBe(false);
    expect(bolehTampilkanUkuran("draf", true)).toBe(true);
    expect(bolehTampilkanUkuran("ditinjau_ahli", false)).toBe(true);
    expect(bolehTampilkanUkuran("disetujui", false)).toBe(true);
  });
});

describe("istilah teknis", () => {
  it("menemukan istilah yang muncul di teks kartu, tanpa peduli huruf besar", () => {
    const kartu = k.kartu.find((x) => x.id === "bath-transfer-toilet")!;
    const kata = istilahDalam(JSON.stringify(kartu), k.ui.istilah).map((i) => i.kata);
    expect(kata).toEqual(expect.arrayContaining(["grab bar", "raised toilet seat", "anti-slip"]));
  });
  it("kartu pendamping tidak memunculkan istilah yang tidak ada", () => {
    const kartu = k.kartu.find((x) => x.id === "care-assist-transfer")!;
    expect(istilahDalam(JSON.stringify(kartu), k.ui.istilah)).toEqual([]);
  });
});

describe("format rupiah", () => {
  it("memformat angka dan rentang", () => {
    expect(formatRp(50000)).toBe("Rp 50.000");
    expect(formatRentang({ min: 0, max: 0 })).toBe("Rp 0");
    expect(formatRentang({ min: 50000, max: 100000 })).toBe("Rp 50.000 - Rp 100.000");
  });
});
