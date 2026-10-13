import { describe, expect, it } from "vitest";
import { isi } from "../src/lib/teks";
import { bisaLanjut, ubahPilihan } from "../src/state/onboarding";
import { KUNCI, hapus, muat, simpan, stateAwal } from "../src/state/storage";

function gudangPalsu(awal: Record<string, string> = {}) {
  const d = new Map(Object.entries(awal));
  return {
    d,
    getItem: (k: string) => d.get(k) ?? null,
    setItem: (k: string, v: string) => void d.set(k, v),
    removeItem: (k: string) => void d.delete(k),
  };
}

describe("penyimpanan lokal", () => {
  it("memakai kunci berversi transisi:v1", () => {
    expect(KUNCI).toBe("transisi:v1");
  });
  it("simpan lalu muat memberi data yang sama", () => {
    const g = gudangPalsu();
    const s = { ...stateAwal(), onboarding: { hunian: ["kos"], alat_bantu: ["kruk", "walker"] } };
    expect(simpan(s, g)).toBe(true);
    expect(muat(g)).toEqual(s);
  });
  it("kosong -> state awal", () => {
    expect(muat(gudangPalsu())).toEqual(stateAwal());
  });
  it("JSON rusak -> state awal tanpa error", () => {
    expect(muat(gudangPalsu({ [KUNCI]: "{bukan json" }))).toEqual(stateAwal());
  });
  it("bentuk salah atau versi lain -> state awal", () => {
    expect(muat(gudangPalsu({ [KUNCI]: JSON.stringify({ versi: 2, onboarding: {} }) }))).toEqual(stateAwal());
    expect(muat(gudangPalsu({ [KUNCI]: JSON.stringify({ versi: 1, onboarding: { a: "bukan array" } }) }))).toEqual(stateAwal());
  });
  it("hapus menghilangkan data", () => {
    const g = gudangPalsu();
    simpan({ ...stateAwal(), onboarding: { a: ["b"] } }, g);
    hapus(g);
    expect(g.d.has(KUNCI)).toBe(false);
    expect(muat(g)).toEqual(stateAwal());
  });
  it("tidak melempar bila penyimpanan tidak ada atau error", () => {
    expect(muat(null)).toEqual(stateAwal());
    expect(simpan(stateAwal(), null)).toBe(false);
    expect(() => hapus(null)).not.toThrow();
    const rusak = {
      getItem: () => { throw new Error("x"); },
      setItem: () => { throw new Error("penuh"); },
      removeItem: () => { throw new Error("x"); },
    };
    expect(muat(rusak)).toEqual(stateAwal());
    expect(simpan(stateAwal(), rusak)).toBe(false);
    expect(() => hapus(rusak)).not.toThrow();
  });
});

describe("pilihan onboarding", () => {
  it("satu pilihan: mengganti", () => {
    expect(ubahPilihan(false, ["a"], "b")).toEqual(["b"]);
  });
  it("banyak pilihan: menambah dan melepas", () => {
    expect(ubahPilihan(true, ["kruk"], "walker")).toEqual(["kruk", "walker"]);
    expect(ubahPilihan(true, ["kruk", "walker"], "kruk")).toEqual(["walker"]);
  });
  it("'belum ada' tidak bisa digabung dengan alat lain", () => {
    expect(ubahPilihan(true, ["kruk", "walker"], "belum_ada")).toEqual(["belum_ada"]);
    expect(ubahPilihan(true, ["belum_ada"], "kruk")).toEqual(["kruk"]);
  });
  it("lanjut hanya bila ada pilihan", () => {
    expect(bisaLanjut(undefined)).toBe(false);
    expect(bisaLanjut([])).toBe(false);
    expect(bisaLanjut(["a"])).toBe(true);
  });
});

describe("isi templat", () => {
  it("mengganti placeholder", () => {
    expect(isi("Pertanyaan {n} dari {total}", { n: 2, total: 6 })).toBe("Pertanyaan 2 dari 6");
    expect(isi("{x}", {})).toBe("{x}");
  });
});

import { parseState } from "../src/state/storage";

describe("parseState (validasi tulisan tangan)", () => {
  const sah = {
    versi: 1,
    onboarding: { hunian: ["kos"] },
    asesmen: { status: { toilet: "sulit" }, prioritas: ["toilet"], jawaban: { a: true } },
    checklist: { "x:tanpa_biaya": [0, 2] },
    checkin: "soal_biaya",
    riwayatCheckin: { "2026-10-13": "soal_biaya", "2026-10-14": "capek_fisik" },
    hasil: { "bath-door": { status: "cukup", tingkat: "tanpa_biaya" } },
    ruangan: "kamar_mandi",
  };
  it("menerima data sah apa adanya", () => {
    expect(parseState(sah)).toEqual(sah);
  });
  it("mengisi bagian yang hilang dengan bawaan", () => {
    expect(parseState({ versi: 1 })).toEqual(stateAwal());
    expect(parseState({ versi: 1, asesmen: {} })?.asesmen).toEqual({ status: {}, prioritas: [], jawaban: {} });
  });
  it.each([
    ["bukan objek", "teks"],
    ["null", null],
    ["array", []],
    ["versi lain", { ...sah, versi: 2 }],
    ["tanpa versi", { onboarding: {} }],
    ["onboarding bukan array", { ...sah, onboarding: { a: "x" } }],
    ["onboarding berisi angka", { ...sah, onboarding: { a: [1] } }],
    ["aktivitas tidak dikenal", { ...sah, asesmen: { ...sah.asesmen, status: { dapur: "sulit" } } }],
    ["status tidak dikenal", { ...sah, asesmen: { ...sah.asesmen, status: { toilet: "mudah" } } }],
    ["prioritas tiga", { ...sah, asesmen: { ...sah.asesmen, prioritas: ["mandi", "toilet", "wudhu"] } }],
    ["prioritas tidak dikenal", { ...sah, asesmen: { ...sah.asesmen, prioritas: ["dapur"] } }],
    ["jawaban bukan boolean", { ...sah, asesmen: { ...sah.asesmen, jawaban: { a: "ya" } } }],
    ["asesmen bukan objek", { ...sah, asesmen: 3 }],
    ["nomor langkah negatif", { ...sah, checklist: { a: [-1] } }],
    ["nomor langkah pecahan", { ...sah, checklist: { a: [1.5] } }],
    ["checkin bukan teks", { ...sah, checkin: 5 }],
    ["riwayat check-in bukan teks", { ...sah, riwayatCheckin: { "2026-10-14": 3 } }],
    ["riwayat check-in dengan tanggal salah", { ...sah, riwayatCheckin: { kemarin: "capek_fisik" } }],
    ["hasil status tidak dikenal", { ...sah, hasil: { a: { status: "mungkin", tingkat: "tanpa_biaya" } } }],
    ["hasil tingkat tidak dikenal", { ...sah, hasil: { a: { status: "cukup", tingkat: "mewah" } } }],
    ["hasil bukan objek", { ...sah, hasil: { a: "cukup" } }],
    ["ruangan bukan teks", { ...sah, ruangan: 3 }],
  ])("menolak: %s", (_n, x) => {
    expect(parseState(x)).toBeNull();
  });
  it("tidak ikut membawa kunci asing", () => {
    expect(parseState({ ...sah, rahasia: "x" })).toEqual(sah);
  });
});
