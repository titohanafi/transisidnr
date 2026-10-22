import { readdirSync, readFileSync } from "node:fs";
import { join, basename } from "node:path";
import { ukuranAksesibelSchema } from "../src/domain/schema";
import { validasiKonten } from "../src/domain/validasi";

const root = join(import.meta.dirname, "..", "content");
const baca = (p: string): unknown => JSON.parse(readFileSync(join(root, p), "utf8"));

try {
  const files = readdirSync(join(root, "kartu")).filter((f) => f.endsWith(".json"));
  const kartu = files.map((f) => baca(join("kartu", f)));
  const konten = validasiKonten({
    kartu,
    asesmen: baca("asesmen.json"),
    config: baca("config.json"),
    onboarding: baca("onboarding.json"),
    ui: baca("ui.json"),
    kontak: baca("kontak.json"),
  });
  const salah = konten.kartu.filter((k, i) => `${k.id}.json` !== basename(files[i]));
  if (salah.length) throw new Error("Nama file harus sama dengan id: " + salah.map((k) => k.id).join(", "));
  const ukuran = ukuranAksesibelSchema.parse(baca("ukuran-aksesibel.json"));
  console.log(
    `Konten valid: ${konten.kartu.length} kartu, ${konten.asesmen.pertanyaan.length} pertanyaan, ${konten.kontak.entri.length} kontak, ${ukuran.entri.length} ukuran aksesibel.`,
  );
} catch (e) {
  console.error((e as Error).message);
  process.exit(1);
}
