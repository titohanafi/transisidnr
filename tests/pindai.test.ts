import { describe, expect, it } from "vitest";
import { konten } from "../src/domain/content";
import { hitungSkor, nomorItemHasil, OBJEK_DENAH, posisiPersenDenah, selesaikanTabrakanDenah, type StatusItem } from "../src/domain/pindai";
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

describe("varian shower dari respons", () => {
  const dasar = { kamar_mandi: true, temuan: [] };
  it("memakai varian yang sah", () => {
    expect(bacaRespons({ ...dasar, varian_shower: "hand_shower_gantung" }, ids)?.varianShower).toBe("hand_shower_gantung");
    expect(bacaRespons({ ...dasar, varian_shower: "ember_gayung" }, ids)?.varianShower).toBe("ember_gayung");
  });
  it("varian asing, salah tipe, atau hilang dianggap tidak jelas", () => {
    expect(bacaRespons({ ...dasar, varian_shower: "bathtub" }, ids)?.varianShower).toBe("tidak_jelas");
    expect(bacaRespons({ ...dasar, varian_shower: 7 }, ids)?.varianShower).toBe("tidak_jelas");
    expect(bacaRespons(dasar, ids)?.varianShower).toBe("tidak_jelas");
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

  it("objek yang hilang atau nilainya tidak dikenal dianggap tidak_terlihat", () => {
    const tanpaObjek = bacaRespons({ kamar_mandi: true, temuan: [] }, ids);
    for (const id of OBJEK_DENAH) expect(tanpaObjek?.objek[id].dinding).toBe("tidak_terlihat");

    const objekSalah = bacaRespons(
      { kamar_mandi: true, temuan: [], objek: { pintu: { dinding: "di luar angkasa", posisi: "kiri" } } },
      ids,
    );
    expect(objekSalah?.objek.pintu.dinding).toBe("tidak_terlihat");

    const objekSah = bacaRespons({ kamar_mandi: true, temuan: [], objek: { pintu: { dinding: "depan", posisi: "kiri" } } }, ids);
    expect(objekSah?.objek.pintu).toEqual({ dinding: "depan", posisi: "kiri" });
  });

  it("dua benda dengan dinding+posisi yang persis sama (dari AI) digeser agar tidak numpuk", () => {
    const r = bacaRespons(
      {
        kamar_mandi: true,
        temuan: [],
        objek: {
          kloset: { dinding: "kanan", posisi: "belakang" },
          area_mandi: { dinding: "kanan", posisi: "belakang" },
        },
      },
      ids,
    );
    expect(r?.objek.kloset).toEqual({ dinding: "kanan", posisi: "belakang" });
    expect(r?.objek.area_mandi).not.toEqual({ dinding: "kanan", posisi: "belakang" });
    expect(r?.objek.area_mandi.dinding).toBe("kanan"); // dindingnya tidak diubah, cuma posisi di sepanjang dinding itu
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

describe("posisi denah", () => {
  it("memetakan dinding+posisi ke persen", () => {
    expect(posisiPersenDenah({ dinding: "kiri", posisi: "depan" })).toEqual({ kiri: 18, atas: 72 });
    expect(posisiPersenDenah({ dinding: "belakang", posisi: "tengah" })).toEqual({ kiri: 50, atas: 20 });
    expect(posisiPersenDenah({ dinding: "kanan", posisi: "belakang" })).toEqual({ kiri: 82, atas: 28 });
  });

  it("selesaikanTabrakanDenah: tidak mengubah posisi yang sudah beda; menggeser yang bertabrakan di dinding yang sama", () => {
    const tanpaTabrakan = {
      pintu: { dinding: "depan", posisi: "kiri" },
      kloset: { dinding: "belakang", posisi: "kanan" },
      wastafel: { dinding: "belakang", posisi: "kiri" },
      area_mandi: { dinding: "kanan", posisi: "tengah" },
    } as const;
    expect(selesaikanTabrakanDenah(tanpaTabrakan)).toEqual(tanpaTabrakan);

    const tabrakanGanda = {
      pintu: { dinding: "tidak_terlihat", posisi: "tengah" },
      kloset: { dinding: "kanan", posisi: "belakang" },
      wastafel: { dinding: "kiri", posisi: "depan" },
      area_mandi: { dinding: "kanan", posisi: "belakang" },
    } as const;
    const hasil = selesaikanTabrakanDenah(tabrakanGanda);
    expect(hasil.kloset).toEqual({ dinding: "kanan", posisi: "belakang" }); // prioritas lebih tinggi, tidak digeser
    expect(hasil.area_mandi).toEqual({ dinding: "kanan", posisi: "tengah" }); // digeser satu langkah di dinding yang sama
  });

  it("selesaikanTabrakanDenah: benda bertabrakan di ujung dinding tidak bisa digeser lagi", () => {
    const hasil = selesaikanTabrakanDenah({
      pintu: { dinding: "tidak_terlihat", posisi: "tengah" },
      kloset: { dinding: "kiri", posisi: "depan" },
      wastafel: { dinding: "kiri", posisi: "depan" },
      area_mandi: { dinding: "tidak_terlihat", posisi: "tengah" },
    });
    expect(hasil.kloset).toEqual({ dinding: "kiri", posisi: "depan" });
    expect(hasil.wastafel).toEqual({ dinding: "kiri", posisi: "depan" }); // tetap sama; tidak ada tempat lagi untuk digeser
  });

  it("nomorItemHasil: semua hal bernomor urut 1..n; tanpa temuan (semua tidak_jelas) ikut urutan konten", () => {
    const nomor = nomorItemHasil(ids, {});
    expect(Object.keys(nomor)).toEqual(ids);
    expect(Object.values(nomor)).toEqual(ids.map((_, i) => i + 1));
  });

  it("nomorItemHasil: mengikuti urutan tampil per status (perhatian, lalu ramah, lalu tidak_jelas), bukan urutan konten", () => {
    // ids: lantai, pegangan, area_mandi, pintu, ruang, wastafel, jangkauan
    const temuan: Record<string, StatusItem> = {
      lantai: "ramah",
      pegangan: "perhatian",
      area_mandi: "tidak_jelas",
      pintu: "ramah",
      ruang: "perhatian",
      wastafel: "tidak_jelas",
      jangkauan: "ramah",
    };
    const nomor = nomorItemHasil(ids, temuan);
    // perhatian dulu (urutan konten di antara sesama perhatian: pegangan sebelum ruang)
    expect(nomor.pegangan).toBe(1);
    expect(nomor.ruang).toBe(2);
    // lalu ramah (lantai, pintu, jangkauan)
    expect(nomor.lantai).toBe(3);
    expect(nomor.pintu).toBe(4);
    expect(nomor.jangkauan).toBe(5);
    // lalu tidak_jelas (area_mandi sebelum wastafel)
    expect(nomor.area_mandi).toBe(6);
    expect(nomor.wastafel).toBe(7);
  });
});

describe("konten pindai", () => {
  it("tiap hal menunjuk kartu yang ada", () => {
    const kartu = new Set(konten.kartu.map((k) => k.id));
    for (const it of konten.ui.pindai.item) expect(kartu.has(it.kartu), it.kartu).toBe(true);
  });
});
