import { describe, expect, it } from "vitest";
import { gambarAkses } from "../src/domain/gambarAkses";
import { JENIS_BENDA, susunBenda } from "../src/domain/gambarBenda";
import { susunGambar, type ModeGambar, type Primitif } from "../src/domain/gambarShower";
import { VARIAN_SHOWER, type VarianShower } from "../src/domain/pindai";

// Tes golden: gambar yang sudah disetujui pemilik dikunci sebagai snapshot koordinat (dibulatkan 1 desimal). Perubahan
// gambar yang tidak disengaja membuat tes ini gagal. Memperbarui snapshot (`npx vitest run -u`) HANYA setelah pemilik
// menyetujui perubahan di papan Claude Design; lalu terbitkan ulang papan lewat `scripts/ekspor-papan.ts`.
const bulat = (v: unknown): unknown => {
  if (typeof v === "number") return Math.round(v * 10) / 10;
  if (Array.isArray(v)) return v.map(bulat);
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, bulat(x)]));
  return v;
};
const potret = (daftar: Primitif[]) => bulat(daftar);

describe("gambar yang disetujui (golden)", () => {
  it.each(JENIS_BENDA)("benda %s", (jenis) => {
    expect(potret(susunBenda(jenis, "kanan"))).toMatchSnapshot();
  });

  const KASUS_SHOWER: [VarianShower, ModeGambar][] = VARIAN_SHOWER.flatMap((v): [VarianShower, ModeGambar][] =>
    v === "hand_shower_gantung"
      ? [
          [v, "kondisi"],
          [v, "hack"],
          [v, "permanen"],
        ]
      : [[v, "kondisi"]],
  );
  it.each(KASUS_SHOWER)("shower %s (%s)", (varian, mode) => {
    expect(potret(susunGambar(varian, mode, "kanan", { anotasi: varian === "hand_shower_gantung" }))).toMatchSnapshot();
  });

  it.each(["kondisi", "hack", "permanen"] as ModeGambar[])("akses mandi (%s)", (mode) => {
    expect(potret(gambarAkses(mode))).toMatchSnapshot();
  });
});
