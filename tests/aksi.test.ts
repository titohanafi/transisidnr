import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { aksiTersedia, aksiUtama, jalurAksi, kunciChecklist } from "../src/domain/aksi";
import { barangSchema, kartuSchema } from "../src/domain/schema";
import { validasiKonten } from "../src/domain/validasi";
import { butirBrief, susunBrief, urlWhatsApp, type BahanBrief } from "../src/lib/brief";
import { setPengirim, track } from "../src/lib/events";
import { parseState, stateAwal } from "../src/state/storage";

const root = join(__dirname, "..", "content");
const baca = (p: string): unknown => JSON.parse(readFileSync(join(root, p), "utf8"));
const k = validasiKonten({
  kartu: readdirSync(join(root, "kartu")).map((f) => baca(join("kartu", f))),
  asesmen: baca("asesmen.json"), config: baca("config.json"), onboarding: baca("onboarding.json"), ui: baca("ui.json"),
});
const t = k.ui.aksi.brief;
const kartu = k.kartu.find((x) => x.id === "bath-transfer-toilet")!;
const bahan = (o: Partial<BahanBrief> = {}): BahanBrief => ({
  kartu, tingkat: "renovasi", hunianId: "milik_sendiri", hunianLabel: "Milik sendiri",
  budgetLabel: "Rp 2 - 10 juta", budgetBelumTahu: false, adaFoto: false, ...o,
});

describe("aksi per tingkat", () => {
  it("aksi utama sesuai tingkat", () => {
    expect(aksiUtama("tanpa_biaya", 0)).toBe("sendiri");
    expect(aksiUtama("alat_tanpa_bongkar", 3)).toBe("beli");
    expect(aksiUtama("alat_tanpa_bongkar", 0)).toBe("sendiri");
    expect(aksiUtama("renovasi", 0)).toBe("tukang");
  });
  it("aksi tersedia mengikuti isi kartu", () => {
    expect(aksiTersedia(kartu, "tanpa_biaya")).toEqual(["sendiri"]);
    expect(aksiTersedia(kartu, "alat_tanpa_bongkar")).toEqual(["sendiri", "beli", "tukang"]);
    expect(aksiTersedia(kartu, "renovasi")).toEqual(["sendiri", "tukang"]);
    const pendamping = k.kartu.find((x) => x.id === "care-assist-transfer")!;
    expect(aksiTersedia(pendamping, "tanpa_biaya")).toEqual(["sendiri"]);
    expect(aksiTersedia(pendamping, "renovasi")).toEqual([]);
  });
  it("jalur dan kunci", () => {
    expect(jalurAksi("beli", "a", "alat_tanpa_bongkar")).toBe("/aksi/beli/a/alat_tanpa_bongkar");
    expect(jalurAksi("ahli", "a")).toBe("/aksi/ahli/a");
    expect(kunciChecklist("a", "renovasi")).toBe("a:renovasi");
  });
});

describe("brief untuk tukang", () => {
  const teks = (o?: Partial<BahanBrief>) => susunBrief(butirBrief(bahan(o), t));

  it("memuat ruangan, masalah, modifikasi, hunian, dan budget", () => {
    const x = teks();
    expect(x).toContain("Ruangan: Kamar mandi");
    expect(x).toContain("Masalah: Sulit pindah dari kursi roda ke kloset");
    expect(x).toContain("Pasang grab bar permanen di dinding.");
    expect(x).toContain("Jenis hunian: Milik sendiri");
    expect(x).toContain("Budget kasar: Rp 2 - 10 juta");
  });
  it.each(["kontrakan", "kos"])("%s menambah larangan bongkar permanen tanpa izin pemilik", (h) => {
    expect(teks({ hunianId: h, hunianLabel: h })).toContain("Tidak boleh bongkar permanen tanpa izin pemilik.");
  });
  it("milik sendiri tidak menambah larangan itu", () => {
    expect(teks()).not.toContain("izin pemilik");
  });
  it("budget belum dijawab atau belum tahu -> 'belum tahu'", () => {
    expect(teks({ budgetLabel: null, budgetBelumTahu: true })).toContain("Budget kasar: belum tahu");
    expect(teks({ budgetLabel: "Belum tahu", budgetBelumTahu: true })).toContain("Budget kasar: belum tahu");
  });
  it("catatan foto hanya bila ada foto", () => {
    expect(teks()).not.toContain("Foto akan dikirim terpisah");
    expect(teks({ adaFoto: true })).toContain("Foto akan dikirim terpisah.");
  });
  it("tanpa hunian: butir hunian tidak ada", () => {
    expect(teks({ hunianId: null, hunianLabel: null })).not.toContain("Jenis hunian");
  });
  it("tidak memuat data medis atau tanggal kejadian", () => {
    const semua = teks({ hunianId: "kontrakan", hunianLabel: "Kontrakan", adaFoto: true }).toLowerCase();
    for (const kata of ["amputasi", "protesis", "bulan", "kejadian", "nyeri", "luka"]) expect(semua).not.toContain(kata);
  });
  it("butir yang tidak dicentang atau dikosongkan tidak ikut", () => {
    const b = butirBrief(bahan(), t).map((x) => (x.id === "budget" ? { ...x, ikut: false } : x.id === "ruangan" ? { ...x, teks: "  " } : x));
    const x = susunBrief(b);
    expect(x).not.toContain("Budget");
    expect(x).not.toContain("Ruangan");
  });
  it("suntingan teks dipakai", () => {
    const b = butirBrief(bahan(), t).map((x) => (x.id === "sapaan" ? { ...x, teks: "Selamat pagi, Pak." } : x));
    expect(susunBrief(b).startsWith("Selamat pagi, Pak.")).toBe(true);
  });
  it("semua butir dimatikan -> pesan kosong", () => {
    expect(susunBrief(butirBrief(bahan(), t).map((x) => ({ ...x, ikut: false })))).toBe("");
  });
});

describe("tautan WhatsApp", () => {
  it("tanpa nomor dan teks ter-encode", () => {
    const u = urlWhatsApp("Halo & selamat\npagi 100%");
    expect(u.startsWith("https://wa.me/?text=")).toBe(true);
    expect(u).toBe("https://wa.me/?text=" + encodeURIComponent("Halo & selamat\npagi 100%"));
    expect(u).not.toMatch(/wa\.me\/\d/);
    expect(decodeURIComponent(u.split("text=")[1])).toBe("Halo & selamat\npagi 100%");
  });
});

describe("tautan produk", () => {
  const dasar = { nama: "a", spesifikasi: "b", cek_kecocokan: "c", kisaran_harga: null, afiliasi: false };
  it("hanya http(s)", () => {
    expect(barangSchema.safeParse({ ...dasar, link: "https://toko.example/x" }).success).toBe(true);
    expect(barangSchema.safeParse({ ...dasar, link: null }).success).toBe(true);
    expect(barangSchema.safeParse({ ...dasar, link: "javascript:alert(1)" }).success).toBe(false);
    expect(barangSchema.safeParse({ ...dasar, link: "data:text/html,x" }).success).toBe(false);
  });
  it("sumber juga hanya http(s)", () => {
    const m = structuredClone(kartu) as Record<string, unknown>;
    m.sumber = [{ judul: "x", url: "javascript:alert(1)" }];
    expect(kartuSchema.safeParse(m).success).toBe(false);
  });
});

describe("checklist tersimpan", () => {
  it("state lama tanpa checklist tetap terbaca", () => {
    expect(parseState({ versi: 1 })?.checklist).toEqual({});
    expect(stateAwal().checklist).toEqual({});
  });
  it("menolak nomor langkah yang bukan bilangan bulat", () => {
    expect(parseState({ versi: 1, checklist: { "a:b": [-1] } })).toBeNull();
  });
});

describe("track", () => {
  it("bawaannya tidak mengirim apa pun dan tidak error", () => {
    setPengirim(null);
    expect(() => track("aksi_klik", { jenis: "beli", kartu_id: "x" })).not.toThrow();
  });
  it("memanggil pengirim terpasang dengan props yang dibersihkan", () => {
    const f = vi.fn();
    setPengirim(f);
    track("aksi_klik", { jenis: "beli", kartu_id: "x".repeat(200), n: 3, ok: true, aneh: { a: 1 } as never });
    setPengirim(null);
    expect(f).toHaveBeenCalledTimes(1);
    const [nama, props] = f.mock.calls[0];
    expect(nama).toBe("aksi_klik");
    expect(props).toEqual({ jenis: "beli", kartu_id: "x".repeat(64), n: 3, ok: true });
  });
  it("galat pada pengirim tidak merusak aplikasi", () => {
    setPengirim(() => {
      throw new Error("jaringan");
    });
    expect(() => track("brief_dibuat", {})).not.toThrow();
    setPengirim(null);
  });
});
