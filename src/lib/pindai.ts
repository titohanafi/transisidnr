import { STATUS_ITEM, type StatusItem } from "../domain/pindai";

export interface HasilModel {
  kamarMandi: boolean;
  temuan: Record<string, StatusItem>;
}

export type KodeGalat = "belum_diatur" | "jaringan" | "respons";
export class GalatPindai extends Error {
  constructor(public kode: KodeGalat) {
    super(kode);
  }
}

const adalahObjek = (x: unknown): x is Record<string, unknown> => typeof x === "object" && x !== null && !Array.isArray(x);

/** Memeriksa respons fungsi pindai (ditulis tangan agar zod tidak ikut bundel). Hal yang hilang dianggap tidak jelas. */
export function bacaRespons(x: unknown, idItem: string[]): HasilModel | null {
  if (!adalahObjek(x) || typeof x.kamar_mandi !== "boolean" || !Array.isArray(x.temuan)) return null;
  const temuan: Record<string, StatusItem> = Object.fromEntries(idItem.map((id) => [id, "tidak_jelas" as StatusItem]));
  for (const t of x.temuan) {
    if (!adalahObjek(t) || typeof t.id !== "string" || !idItem.includes(t.id)) continue;
    if ((STATUS_ITEM as readonly unknown[]).includes(t.status)) temuan[t.id] = t.status as StatusItem;
  }
  return { kamarMandi: x.kamar_mandi, temuan };
}

/** Mengirim foto (data URL JPEG) ke fungsi pindai (api/pindai.ts) dan mengembalikan hasil yang sudah diperiksa. */
export async function pindaiFoto(
  dataUrl: string,
  idItem: string[],
  url: string = import.meta.env.VITE_PINDAI_URL || "/api/pindai",
  ambil: typeof fetch = fetch,
): Promise<HasilModel> {
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
