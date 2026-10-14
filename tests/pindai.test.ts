import { describe, expect, it } from "vitest";
import { konten } from "../src/domain/content";
import { hitungSkor, type StatusItem } from "../src/domain/pindai";
import { bacaRespons, GalatPindai, pindaiFoto } from "../src/lib/pindai";

const ids = konten.ui.pindai.item.map((i) => i.id);
const semua = (s: StatusItem) => Object.fromEntries(ids.map((id) => [id, s]));

describe("skor pindai", () => {
  it("semua ramah = cukup, semua perhatian = banyak", () => {
    expect(hitungSkor(semua("ramah"), ids).tingkat).toBe("cukup");
    expect(hitungSkor(semua("perhatian"), ids).tingkat).toBe("banyak");
  });
  it("terlalu banyak yang tidak jelas = belum cukup, dan hal yang hilang dianggap tidak jelas", () => {
    expect(hitungSkor({}, ids)).toMatchObject({ tingkat: "belum_cukup", tidakJelas: ids.length, jelas: 0 });
    expect(hitungSkor({ [ids[0]]: "ramah" }, ids).tingkat).toBe("belum_cukup");
  });
  it("campuran = sebagian", () => {
    const t = Object.fromEntries(ids.map((id, i) => [id, (i < 4 ? "ramah" : "perhatian") as StatusItem]));
    expect(hitungSkor(t, ids).tingkat).toBe("sebagian");
  });
});

describe("respons pindai", () => {
  it("menolak bentuk salah, mengabaikan id asing, mengisi yang hilang", () => {
    expect(bacaRespons(null, ids)).toBeNull();
    expect(bacaRespons({ kamar_mandi: "ya", temuan: [] }, ids)).toBeNull();
    const r = bacaRespons(
      {
        kamar_mandi: true,
        temuan: [
          { id: ids[0], status: "ramah" },
          { id: "asing", status: "ramah" },
          { id: ids[1], status: "x" },
        ],
      },
      ids,
    );
    expect(r?.temuan[ids[0]]).toBe("ramah");
    expect(r?.temuan[ids[1]]).toBe("tidak_jelas");
    expect(Object.keys(r?.temuan ?? {})).toEqual(ids);
  });
  it("layanan belum tersedia (404 atau kunci belum diatur) = belum_diatur; 429 = terlalu_sering; respons rusak = galat", async () => {
    const tidakAda = (async () => new Response("", { status: 404 })) as typeof fetch;
    await expect(pindaiFoto("data:image/jpeg;base64,AA", ids, "http://x", tidakAda)).rejects.toMatchObject({ kode: "belum_diatur" });
    const tanpaKunci = (async () => new Response(JSON.stringify({ galat: "kunci belum diatur" }), { status: 500 })) as typeof fetch;
    await expect(pindaiFoto("data:image/jpeg;base64,AA", ids, "http://x", tanpaKunci)).rejects.toMatchObject({ kode: "belum_diatur" });
    const terlaluSering = (async () => new Response("", { status: 429 })) as typeof fetch;
    await expect(pindaiFoto("data:image/jpeg;base64,AA", ids, "http://x", terlaluSering)).rejects.toMatchObject({ kode: "terlalu_sering" });
    const rusak = (async () => new Response(JSON.stringify({ x: 1 }))) as typeof fetch;
    await expect(pindaiFoto("data:image/jpeg;base64,AA", ids, "http://x", rusak)).rejects.toBeInstanceOf(GalatPindai);
  });
});

describe("konten pindai", () => {
  it("tiap hal menunjuk kartu yang ada", () => {
    const kartu = new Set(konten.kartu.map((k) => k.id));
    for (const it of konten.ui.pindai.item) expect(kartu.has(it.kartu), it.kartu).toBe(true);
  });
});
