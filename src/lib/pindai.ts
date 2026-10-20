import {
  DINDING_OBJEK,
  OBJEK_DENAH,
  POSISI_BAWAAN,
  POSISI_DI_DINDING,
  selesaikanTabrakanDenah,
  STATUS_ITEM,
  type ObjekDenah,
  type PosisiObjek,
  type StatusItem,
} from "../domain/pindai";

export interface HasilModel {
  kamarMandi: boolean;
  temuan: Record<string, StatusItem>;
  objek: Record<ObjekDenah, PosisiObjek>;
}

export type KodeGalat = "belum_diatur" | "terlalu_sering" | "jaringan" | "respons";
export class GalatPindai extends Error {
  constructor(public kode: KodeGalat) {
    super(kode);
  }
}

const adalahObjek = (x: unknown): x is Record<string, unknown> => typeof x === "object" && x !== null && !Array.isArray(x);

/** Memeriksa respons fungsi pindai (ditulis tangan agar zod tidak ikut bundel). Hal/objek yang hilang dianggap tidak jelas/tidak terlihat. */
export function bacaRespons(x: unknown, idItem: string[]): HasilModel | null {
  if (!adalahObjek(x) || typeof x.kamar_mandi !== "boolean" || !Array.isArray(x.temuan)) return null;
  const temuan: Record<string, StatusItem> = Object.fromEntries(idItem.map((id) => [id, "tidak_jelas" as StatusItem]));
  for (const t of x.temuan) {
    if (!adalahObjek(t) || typeof t.id !== "string" || !idItem.includes(t.id)) continue;
    if ((STATUS_ITEM as readonly unknown[]).includes(t.status)) temuan[t.id] = t.status as StatusItem;
  }
  const objekMentah = adalahObjek(x.objek) ? x.objek : {};
  const objekMentahSah = Object.fromEntries(
    OBJEK_DENAH.map((id) => {
      const o = objekMentah[id];
      const dinding = adalahObjek(o) && (DINDING_OBJEK as readonly unknown[]).includes(o.dinding) ? o.dinding : "tidak_terlihat";
      const posisi = adalahObjek(o) && (POSISI_DI_DINDING as readonly unknown[]).includes(o.posisi) ? o.posisi : "tengah";
      return [id, { dinding, posisi }];
    }),
  ) as Record<ObjekDenah, PosisiObjek>;
  return { kamarMandi: x.kamar_mandi, temuan, objek: selesaikanTabrakanDenah(objekMentahSah) };
}

/**
 * Hasil tiruan untuk `VITE_PINDAI_MOCK=true`: supaya alur pindai bisa dicoba tanpa memanggil api/pindai.ts (tanpa kunci
 * Gemini, tanpa kuota). Posisi memakai `POSISI_BAWAAN` (bukan tebakan AI sungguhan) — kebetulan juga kira-kira cocok
 * dengan tata letak foto contoh di `dev/mock-foto.jpg` (pintu di depan, wastafel dan kloset berdampingan di dinding
 * belakang dengan kloset di sudut kanan, area mandi menyambung di dinding kanan pada kedalaman tengah).
 */
function hasilTiruan(idItem: string[]): Promise<HasilModel> {
  const temuan = Object.fromEntries(idItem.map((id, i) => [id, STATUS_ITEM[i % STATUS_ITEM.length]])) as Record<string, StatusItem>;
  return new Promise((selesai) => setTimeout(() => selesai({ kamarMandi: true, temuan, objek: POSISI_BAWAAN }), 1200));
}

/** Mengirim foto (data URL JPEG) ke fungsi pindai (api/pindai.ts) dan mengembalikan hasil yang sudah diperiksa. */
export async function pindaiFoto(
  dataUrl: string,
  idItem: string[],
  url: string = import.meta.env.VITE_PINDAI_URL || "/api/pindai",
  ambil: typeof fetch = fetch,
): Promise<HasilModel> {
  if (import.meta.env.VITE_PINDAI_MOCK === "true") return hasilTiruan(idItem);
  const kontrol = new AbortController();
  const batas = setTimeout(() => kontrol.abort(), 30_000);
  try {
    const res = await ambil(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gambar: dataUrl.replace(/^data:image\/\w+;base64,/, "") }),
      signal: kontrol.signal,
    });
    if (
      res.status === 404 ||
      (res.status === 500 &&
        (
          await res
            .clone()
            .json()
            .catch(() => null)
        )?.galat === "kunci belum diatur")
    ) {
      throw new GalatPindai("belum_diatur");
    }
    if (res.status === 429) throw new GalatPindai("terlalu_sering");
    if (!res.ok) throw new GalatPindai("jaringan");
    const hasil = bacaRespons(await res.json(), idItem);
    if (!hasil) throw new GalatPindai("respons");
    return hasil;
  } catch (e) {
    throw e instanceof GalatPindai ? e : new GalatPindai("jaringan");
  } finally {
    clearTimeout(batas);
  }
}
