import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(__dirname, "..");

function berkas(dir: string, ekstensi: string[]): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) return berkas(p, ekstensi);
    return ekstensi.some((e) => n.endsWith(e)) ? [p] : [];
  });
}

// Kata yang dilarang oleh CLAUDE.md (bahasa dan nada). "disabilitas" tidak termasuk "disable".
const DILARANG = [/\borang normal\b/i, /\bcacat\b/i, /\bdisable\b/i, /\bkorban\b/i, /\bpenderita\b/i, /\bkasihan\b/i];

describe("bahasa", () => {
  // Semua teks yang dilihat pengguna ada di content/ (komponen dijaga oleh tes di bawah).
  const konten = berkas(join(root, "content"), [".json"]);

  it.each(konten)("tanpa kata terlarang: %s", (f) => {
    const isi = readFileSync(f, "utf8");
    for (const re of DILARANG) expect(isi, `${re} di ${f}`).not.toMatch(re);
  });
});

describe("teks antarmuka hanya di content/ui.json", () => {
  const tsx = berkas(join(root, "src"), [".tsx"]);

  it.each(tsx)("tidak ada teks tertulis di komponen: %s", (f) => {
    const baris = readFileSync(f, "utf8").split("\n");
    const temuan = baris.filter((b) => {
      const t = b.trim();
      if (t.startsWith("//") || t.startsWith("*") || t.startsWith("/*") || t.startsWith("{/*")) return false;
      const dalamTag = /(?<![=-])>\s*([^<>{}()|&=;\n]*[A-Za-z]{3,}[^<>{}()|&=;\n]*)</.test(t);
      const barisTeks = /^[A-Z][a-z]+( [A-Za-z,.:]+)+$/.test(t);
      return dalamTag || barisTeks;
    });
    expect(temuan).toEqual([]);
  });
});
