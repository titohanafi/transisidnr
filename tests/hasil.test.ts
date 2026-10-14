import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buatRencana, type Masukan } from "../src/domain/engine";
import { terapkanHasil, tingkatBerikutnya } from "../src/domain/hasil";
import { validasiKonten } from "../src/domain/validasi";

const root = join(__dirname, "..", "content");
const baca = (p: string): unknown => JSON.parse(readFileSync(join(root, p), "utf8"));
const k = validasiKonten({
  kartu: readdirSync(join(root, "kartu")).map((f) => baca(join("kartu", f))),
  asesmen: baca("asesmen.json"),
  config: baca("config.json"),
  onboarding: baca("onboarding.json"),
  ui: baca("ui.json"),
  kontak: baca("kontak.json"),
});
const masukan: Masukan = {
  hunian: "milik_sendiri",
  protesis: "tidak",
  kejadianBulanMaks: null,
  budget: null,
  statusAktivitas: {},
  prioritas: ["toilet"],
  jawaban: { "q-toilet-pindah": true, "q-toilet-pegangan": true },
};
const rencana = buatRencana(masukan, k.kartu, k.asesmen, k.config);

describe("terapkanHasil", () => {
  it("tanpa hasil: rencana tidak berubah", () => {
    const h = terapkanHasil(rencana, {}, k.kartu);
    expect(h.beres).toEqual([]);
    expect(h.mulai.map((c) => c.id)).toEqual(rencana.mulaiDariSini.map((c) => c.id));
    expect(h.satuHal).toEqual(rencana.satuHalHariIni);
  });
  it("panduan yang sudah cukup pindah ke beres dan satu hal hari ini berganti", () => {
    const pertama = rencana.mulaiDariSini[0].id;
    const h = terapkanHasil(rencana, { [pertama]: { status: "cukup", tingkat: "tanpa_biaya" } }, k.kartu);
    expect(h.beres.map((c) => c.id)).toEqual([pertama]);
    expect(h.mulai.some((c) => c.id === pertama)).toBe(false);
    expect(h.lainnya.some((c) => c.id === pertama)).toBe(false);
    expect(h.satuHal?.kartuId).not.toBe(pertama);
  });
  it("masih sulit: satu hal hari ini memakai langkah tingkat berikutnya", () => {
    const pertama = rencana.mulaiDariSini[0];
    const h = terapkanHasil(rencana, { [pertama.id]: { status: "masih_sulit", tingkat: "tanpa_biaya" } }, k.kartu);
    expect(h.satuHal?.kartuId).toBe(pertama.id);
    expect(h.satuHal?.tingkat).toBe("alat_tanpa_bongkar");
    expect(h.beres).toEqual([]);
  });
});

describe("tingkatBerikutnya", () => {
  const t = (tingkat: string, tampil = true) => ({ tingkat: tingkat as never, tampil });
  it("melompati tingkat yang tersembunyi", () => {
    expect(tingkatBerikutnya({ tingkat: [t("tanpa_biaya"), t("alat_tanpa_bongkar"), t("renovasi", false)] as never }, "tanpa_biaya")).toBe(
      "alat_tanpa_bongkar",
    );
    expect(
      tingkatBerikutnya({ tingkat: [t("tanpa_biaya"), t("alat_tanpa_bongkar"), t("renovasi", false)] as never }, "alat_tanpa_bongkar"),
    ).toBeUndefined();
  });
});
