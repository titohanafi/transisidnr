import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { pilihanPertanyaan } from "../src/domain/onboarding";
import { validasiKonten, type KontenMentah } from "../src/domain/validasi";

const root = join(__dirname, "..", "content");
const baca = (p: string): unknown => JSON.parse(readFileSync(join(root, p), "utf8"));
const mentah = (): KontenMentah => ({
  kartu: readdirSync(join(root, "kartu")).map((f) => baca(join("kartu", f))),
  asesmen: baca("asesmen.json"),
  config: baca("config.json"),
  onboarding: baca("onboarding.json"),
  ui: baca("ui.json"),
  kontak: baca("kontak.json"),
});

describe("pilihan budget dibaca dari config.json", () => {
  it("onboarding.json tidak lagi menulis daftar budget sendiri", () => {
    const k = validasiKonten(mentah());
    const q = k.onboarding.pertanyaan.find((x) => x.id === "budget")!;
    expect(q.pilihanDari).toBe("budget");
    expect(q.pilihan).toBeUndefined();
  });

  it("pilihan yang tampil sama persis dengan config.budget (id dan label)", () => {
    const k = validasiKonten(mentah());
    const q = k.onboarding.pertanyaan.find((x) => x.id === "budget")!;
    expect(pilihanPertanyaan(q, k.config)).toEqual(k.config.budget.map((b) => ({ id: b.id, label: b.label })));
  });

  it("mengubah config.json langsung mengubah pilihan", () => {
    const m = mentah();
    const c = structuredClone(m.config) as { budget: { id: string; label: string }[] };
    c.budget[0].label = "Label baru";
    c.budget.push({ id: "baru", label: "Pilihan baru", minRp: null, maksRp: null } as never);
    const k = validasiKonten({ ...m, config: c });
    const q = k.onboarding.pertanyaan.find((x) => x.id === "budget")!;
    const p = pilihanPertanyaan(q, k.config);
    expect(p[0].label).toBe("Label baru");
    expect(p.at(-1)).toEqual({ id: "baru", label: "Pilihan baru" });
  });

  it("pertanyaan lain tetap memakai pilihan tertulis", () => {
    const k = validasiKonten(mentah());
    const q = k.onboarding.pertanyaan.find((x) => x.id === "hunian")!;
    expect(pilihanPertanyaan(q, k.config).map((p) => p.id)).toEqual(["milik_sendiri", "kontrakan", "kos", "apartemen"]);
    expect(pilihanPertanyaan(undefined, k.config)).toEqual([]);
  });

  it("validasi gagal bila pertanyaan punya keduanya atau tidak punya sama sekali", () => {
    const m = mentah();
    const dua = structuredClone(m.onboarding) as { pertanyaan: Record<string, unknown>[] };
    const b = dua.pertanyaan.find((x) => x.id === "budget")!;
    b.pilihan = [
      { id: "a", label: "A" },
      { id: "b", label: "B" },
    ];
    expect(() => validasiKonten({ ...m, onboarding: dua })).toThrow(/tepat satu/);

    const nol = structuredClone(m.onboarding) as { pertanyaan: Record<string, unknown>[] };
    delete nol.pertanyaan.find((x) => x.id === "budget")!.pilihanDari;
    expect(() => validasiKonten({ ...m, onboarding: nol })).toThrow(/tepat satu/);
  });
});
