import { GambarShower } from "../components/GambarShower";
import type { ModeGambar, SisiDinding } from "../domain/gambarShower";
import type { VarianShower } from "../domain/pindai";

// Alat dev-only: semua gambar shower sekaligus untuk diperiksa mata (lihat App.tsx, rute /dev/shower).
// Memakai gaya inline supaya kelas Tailwind-nya tidak ikut ke CSS produksi.
interface Kombinasi {
  varian: VarianShower;
  mode: ModeGambar;
  sisi: SisiDinding;
  anotasi: boolean;
}

const KOMBINASI: Kombinasi[] = [
  { varian: "hand_shower_gantung", mode: "kondisi", sisi: "kanan", anotasi: true },
  { varian: "hand_shower_gantung", mode: "hack", sisi: "kanan", anotasi: true },
  { varian: "hand_shower_gantung", mode: "permanen", sisi: "kanan", anotasi: true },
  { varian: "hand_shower_gantung", mode: "kondisi", sisi: "kiri", anotasi: false },
  { varian: "shower_tetap", mode: "kondisi", sisi: "kanan", anotasi: false },
  { varian: "ember_gayung", mode: "kondisi", sisi: "kanan", anotasi: false },
  { varian: "tidak_jelas", mode: "kondisi", sisi: "kanan", anotasi: false },
  { varian: "shower_tetap", mode: "kondisi", sisi: "kiri", anotasi: false },
];

export function PratinjauShowerDev() {
  return (
    <main style={{ padding: 16, display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
      {KOMBINASI.map((k) => (
        <figure key={`${k.varian}${k.mode}${k.sisi}`} style={{ margin: 0, border: "1.5px solid #1F2933", borderRadius: 10, padding: 8 }}>
          <GambarShower varian={k.varian} mode={k.mode} sisi={k.sisi} anotasi={k.anotasi} className="" />
          <figcaption style={{ fontSize: 13 }}>{`${k.varian} / ${k.mode} / ${k.sisi}`}</figcaption>
        </figure>
      ))}
    </main>
  );
}
