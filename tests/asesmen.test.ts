import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { asesmenSchema, type Aktivitas } from "../src/domain/schema";
import { ukuranBaru } from "../src/lib/foto";
import {
  daftarPertanyaan, kandidatPrioritas, perluTahapPrioritas, rapikan, ubahPrioritas,
} from "../src/state/asesmen";
import { KUNCI_FOTO, hapus, muat, muatFoto, simpan, simpanFoto, stateAwal, type AsesmenState } from "../src/state/storage";

const asesmen = asesmenSchema.parse(JSON.parse(readFileSync(join(__dirname, "..", "content", "asesmen.json"), "utf8")));
const ids = (l: { id: string }[]) => l.map((x) => x.id);
const kosong = (): AsesmenState => ({ status: {}, prioritas: [], jawaban: {} });

describe("kandidat prioritas", () => {
  it("hanya aktivitas sulit atau ingin-belum-bisa; umum tidak pernah", () => {
    const k = kandidatPrioritas(asesmen, { mandi: "bisa_sendiri", toilet: "sulit", wudhu: "ingin_belum_bisa" });
    expect(k).toEqual(["toilet", "wudhu"]);
    expect(kandidatPrioritas(asesmen, { umum: "sulit" } as AsesmenState["status"])).toEqual([]);
  });
  it("tahap prioritas hanya bila ada dua kandidat atau lebih", () => {
    expect(perluTahapPrioritas([])).toBe(false);
    expect(perluTahapPrioritas(["toilet"])).toBe(false);
    expect(perluTahapPrioritas(["toilet", "mandi"])).toBe(true);
  });
});

describe("ubah prioritas", () => {
  it("menambah, melepas, dan maksimal dua", () => {
    expect(ubahPrioritas([], "mandi")).toEqual(["mandi"]);
    expect(ubahPrioritas(["mandi"], "toilet")).toEqual(["mandi", "toilet"]);
    expect(ubahPrioritas(["mandi", "toilet"], "wudhu")).toEqual(["mandi", "toilet"]);
    expect(ubahPrioritas(["mandi", "toilet"], "mandi")).toEqual(["toilet"]);
  });
});

describe("daftar pertanyaan", () => {
  it("prioritas dulu (sesuai urutan prioritas), umum selalu terakhir", () => {
    const d = daftarPertanyaan(asesmen, ["toilet", "mandi"]);
    expect(ids(d)).toEqual([
      "q-toilet-pindah", "q-toilet-pegangan", "q-toilet-ruang",
      "q-mandi-masuk", "q-mandi-licin", "q-mandi-jangkau",
      "q-umum-pintu", "q-umum-panggil",
    ]);
  });
  it("tanpa prioritas hanya pertanyaan umum", () => {
    expect(ids(daftarPertanyaan(asesmen, []))).toEqual(["q-umum-pintu", "q-umum-panggil"]);
  });
  it("aktivitas yang tidak jadi prioritas tidak ditanyakan", () => {
    const d = daftarPertanyaan(asesmen, ["wudhu"]);
    expect(d.some((p) => p.aktivitas === "mandi" || p.aktivitas === "toilet")).toBe(false);
  });
  it("umum tidak bisa dijadikan prioritas lewat daftar", () => {
    expect(ids(daftarPertanyaan(asesmen, ["umum" as Aktivitas])).filter((i) => i === "q-umum-pintu")).toHaveLength(2);
  });
});

describe("rapikan", () => {
  it("satu kandidat otomatis jadi prioritas", () => {
    const r = rapikan(asesmen, { ...kosong(), status: { mandi: "sulit", toilet: "bisa_sendiri" } });
    expect(r.prioritas).toEqual(["mandi"]);
  });
  it("tanpa kandidat: prioritas kosong", () => {
    expect(rapikan(asesmen, { ...kosong(), status: { mandi: "bisa_sendiri" }, prioritas: ["mandi"] }).prioritas).toEqual([]);
  });
  it("membuang prioritas yang bukan kandidat lagi, dan membatasi dua", () => {
    const s: AsesmenState = {
      ...kosong(),
      status: { mandi: "sulit", toilet: "sulit", wudhu: "sulit" },
      prioritas: ["mandi", "toilet", "wudhu"] as Aktivitas[],
    };
    expect(rapikan(asesmen, s).prioritas).toEqual(["mandi", "toilet"]);
    expect(rapikan(asesmen, { ...s, status: { toilet: "sulit", wudhu: "sulit" }, prioritas: ["mandi", "toilet"] }).prioritas).toEqual(["toilet"]);
  });
  it("membuang jawaban untuk pertanyaan yang tidak lagi ditanyakan (tidak ada 'ya' basi)", () => {
    const s: AsesmenState = {
      status: { mandi: "sulit", toilet: "sulit" },
      prioritas: ["mandi", "toilet"],
      jawaban: { "q-mandi-licin": true, "q-toilet-pindah": true, "q-umum-pintu": false },
    };
    const r = rapikan(asesmen, { ...s, prioritas: ["toilet"] });
    expect(r.jawaban).toEqual({ "q-toilet-pindah": true, "q-umum-pintu": false });
  });
  it("jawaban umum tetap bila prioritas berubah", () => {
    const s = { ...kosong(), status: { toilet: "sulit" as const }, jawaban: { "q-umum-panggil": true } };
    expect(rapikan(asesmen, s).jawaban).toEqual({ "q-umum-panggil": true });
  });
});

describe("penyimpanan asesmen dan foto", () => {
  const gudang = () => {
    const d = new Map<string, string>();
    return { d, getItem: (k: string) => d.get(k) ?? null, setItem: (k: string, v: string) => void d.set(k, v), removeItem: (k: string) => void d.delete(k) };
  };
  it("asesmen tersimpan dan terbaca kembali", () => {
    const g = gudang();
    const s = { ...stateAwal(), asesmen: { status: { toilet: "sulit" as const }, prioritas: ["toilet" as const], jawaban: { "q-toilet-pindah": true } } };
    simpan(s, g);
    expect(muat(g)).toEqual(s);
  });
  it("data lama tanpa asesmen tetap terbaca (kompatibel)", () => {
    const g = gudang();
    g.d.set("transisi:v1", JSON.stringify({ versi: 1, onboarding: { hunian: ["kos"] } }));
    expect(muat(g)).toEqual({ ...stateAwal(), onboarding: { hunian: ["kos"] } });
  });
  it("foto disimpan terpisah dan ikut terhapus", () => {
    const g = gudang();
    expect(simpanFoto("data:image/jpeg;base64,AAAA", g)).toBe(true);
    expect(muatFoto(g)).toBe("data:image/jpeg;base64,AAAA");
    expect(g.d.has("transisi:v1")).toBe(false);
    hapus(g);
    expect(g.d.has(KUNCI_FOTO)).toBe(false);
    expect(muatFoto(g)).toBeNull();
  });
  it("foto gagal disimpan saat kuota penuh tanpa melempar", () => {
    const penuh = { getItem: () => null, setItem: () => { throw new Error("QuotaExceeded"); }, removeItem: () => {} };
    expect(simpanFoto("data:image/jpeg;base64,AAAA", penuh)).toBe(false);
  });
  it("isi bukan gambar diabaikan", () => {
    const g = gudang();
    g.d.set(KUNCI_FOTO, "<script>");
    expect(muatFoto(g)).toBeNull();
  });
});

describe("ukuran foto", () => {
  it("mengecilkan dengan rasio tetap", () => {
    expect(ukuranBaru(4000, 3000)).toEqual({ lebar: 1024, tinggi: 768 });
    expect(ukuranBaru(3000, 4000)).toEqual({ lebar: 768, tinggi: 1024 });
  });
  it("tidak memperbesar", () => {
    expect(ukuranBaru(500, 300)).toEqual({ lebar: 500, tinggi: 300 });
  });
});
