import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { validasiKonten, type KontenMentah } from "../src/domain/validasi";

const root = join(__dirname, "..", "content");
const baca = (p: string): unknown => JSON.parse(readFileSync(join(root, p), "utf8"));

function muat(): KontenMentah {
  const kartu = readdirSync(join(root, "kartu"))
    .filter((f) => f.endsWith(".json"))
    .map((f) => baca(join("kartu", f)));
  return {
    kartu,
    asesmen: baca("asesmen.json"),
    config: baca("config.json"),
    onboarding: baca("onboarding.json"),
    ui: baca("ui.json"),
    kontak: baca("kontak.json"),
  };
}

describe("validasi konten", () => {
  it("konten asli valid dan berisi 11 kartu", () => {
    expect(validasiKonten(muat()).kartu).toHaveLength(11);
  });

  it("gagal bila memicu_kartu menunjuk id yang tidak ada", () => {
    const m = muat();
    const a = structuredClone(m.asesmen) as { pertanyaan: { memicu_kartu: string[] }[] };
    a.pertanyaan[0].memicu_kartu = ["kartu-tidak-ada"];
    expect(() => validasiKonten({ ...m, asesmen: a })).toThrow(/kartu-tidak-ada/);
  });

  it("gagal bila kartu bukan kerangka tetapi isinya kurang", () => {
    const m = muat();
    const k = structuredClone(m.kartu[0]) as Record<string, unknown>;
    delete k.solusi;
    expect(() => validasiKonten({ ...m, kartu: [k] })).toThrow();
  });

  it("gagal bila solusi tidak punya tingkat sama sekali", () => {
    const m = muat();
    const k = structuredClone(m.kartu.find((x) => (x as { id: string }).id === "bath-transfer-toilet")) as Record<string, unknown>;
    k.solusi = {};
    expect(() => validasiKonten({ ...m, kartu: [k] })).toThrow(/minimal/);
  });
});
