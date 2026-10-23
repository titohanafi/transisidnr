import {
  DINDING_OBJEK,
  JENIS_KLOSET,
  OBJEK_DENAH,
  POSISI_BAWAAN,
  POSISI_DI_DINDING,
  rapikanSudutDenah,
  selesaikanTabrakanDenah,
  STATUS_ITEM,
  VARIAN_PINTU,
  VARIAN_SHOWER,
  type JenisKloset,
  type ObjekDenah,
  type PosisiObjek,
  type StatusItem,
  type VarianPintu,
  type VarianShower,
} from "../domain/pindai";

export interface HasilModel {
  kamarMandi: boolean;
  temuan: Record<string, StatusItem>;
  objek: Record<ObjekDenah, PosisiObjek>;
  varianShower: VarianShower;
  jenisKloset: JenisKloset;
  varianPintu: VarianPintu;
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
  const varianShower = (VARIAN_SHOWER as readonly unknown[]).includes(x.varian_shower) ? (x.varian_shower as VarianShower) : "tidak_jelas";
  const jenisKloset = (JENIS_KLOSET as readonly unknown[]).includes(x.jenis_kloset) ? (x.jenis_kloset as JenisKloset) : "tidak_jelas";
  const varianPintu = (VARIAN_PINTU as readonly unknown[]).includes(x.varian_pintu) ? (x.varian_pintu as VarianPintu) : "tidak_jelas";
  return {
    kamarMandi: x.kamar_mandi,
    temuan,
    objek: selesaikanTabrakanDenah(rapikanSudutDenah(objekMentahSah)),
    varianShower,
    jenisKloset,
    varianPintu,
  };
}

// Status tiap hal untuk foto contoh `dev/mock-foto.jpg`, dinilai dari yang tampak di foto itu sendiri (bukan
// ditebak asal) — supaya hasil mock masuk akal dibandingkan foto yang ditampilkan, bukan sekadar pola berulang.
// Lihat foto: tidak ada pegangan sama sekali ("perhatian"), area mandi menyatu dengan lantai tanpa bibir/undakan
// ("ramah"), wastafel ada tempat sampah+botol menumpuk di bawahnya jadi ruang kaki tidak terlihat bebas
// ("perhatian"), ruang gerak sempit karena kloset dan area mandi berdekatan ("perhatian"); lantai, pintu, dan
// jangkauan keran/shower tidak bisa dipastikan dari sudut foto ini ("tidak_jelas").
const STATUS_TIRUAN: Partial<Record<string, StatusItem>> = {
  lantai: "tidak_jelas",
  pegangan: "perhatian",
  area_mandi: "ramah",
  pintu: "tidak_jelas",
  ruang: "perhatian",
  wastafel: "perhatian",
  jangkauan: "tidak_jelas",
};

/**
 * Hasil tiruan untuk `VITE_PINDAI_MOCK=true`: supaya alur pindai bisa dicoba tanpa memanggil server/pindai.ts (tanpa kunci
 * Gemini, tanpa kuota). Posisi memakai `POSISI_BAWAAN` (bukan tebakan AI sungguhan) — kebetulan juga kira-kira cocok
 * dengan tata letak foto contoh di `dev/mock-foto.jpg` (pintu di depan, wastafel dan kloset berdampingan di dinding
 * belakang dengan kloset di sudut kanan, area mandi menyambung di dinding kanan pada kedalaman tengah).
 */
function hasilTiruan(idItem: string[]): Promise<HasilModel> {
  // Hal yang belum ada di STATUS_TIRUAN (mis. ditambahkan ke konten tapi belum dinilai di sini) tetap diberi status
  // berganti-ganti supaya tiap tab tetap kebagian isi, bukan dibiarkan "tidak_jelas" semua.
  const temuan = Object.fromEntries(idItem.map((id, i) => [id, STATUS_TIRUAN[id] ?? STATUS_ITEM[i % STATUS_ITEM.length]])) as Record<
    string,
    StatusItem
  >;
  // Foto contoh menampilkan hand shower yang digantung di dinding, bersama keran, kloset duduk, dan pintu berengsel.
  return new Promise((selesai) =>
    setTimeout(
      () =>
        selesai({
          kamarMandi: true,
          temuan,
          objek: POSISI_BAWAAN,
          varianShower: "hand_shower_gantung",
          jenisKloset: "duduk",
          varianPintu: "ayun_ke_dalam",
        }),
      1200,
    ),
  );
}

/** Mengirim foto (data URL JPEG) ke fungsi pindai (server/pindai.ts) dan mengembalikan hasil yang sudah diperiksa. */
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
