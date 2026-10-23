import { konten } from "../domain/content";
import { langkahGambarShower, type ModeGambar } from "../domain/gambarShower";
import { VARIAN_SHOWER, type VarianShower } from "../domain/pindai";
import { GambarShower } from "./GambarShower";
import { Lipat } from "./Lipat";
import { PilihanPil } from "./Pilihan";

const p = konten.ui.pindai.panelShower;

const LENCANA: Record<ModeGambar, string> = {
  kondisi: "border-2 border-dashed border-tinta",
  hack: "border-2 border-tinta",
  permanen: "border-2 border-tinta bg-tinta text-white",
};

function Langkah({
  nomor,
  mode,
  varian,
  teks,
  anotasi,
}: {
  nomor?: number;
  mode: ModeGambar;
  varian: VarianShower;
  teks?: string;
  anotasi: boolean;
}) {
  const l = p.langkah[mode];
  return (
    <figure className="m-0 flex flex-col gap-2">
      <figcaption className="flex items-center gap-3">
        {nomor !== undefined && (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-tombol border-2 border-tinta text-judulKartu font-bold">
            {nomor}
          </span>
        )}
        <span className={`rounded px-2 py-0.5 text-mikro font-bold uppercase tracking-wide ${LENCANA[mode]}`}>{l.label}</span>
        <span className="text-kecil text-redup">{l.sub}</span>
      </figcaption>
      <GambarShower
        varian={varian}
        mode={mode}
        anotasi={anotasi}
        className="mx-auto w-full max-w-[20rem] rounded-tombol border border-garis"
      />
      <p className="text-kecil">{teks ?? l.isi}</p>
    </figure>
  );
}

/**
 * Gambar jenis shower untuk satu hal di "Rincian per indikator" (keran dan shower): pilihan jenis (hasil baca foto,
 * bisa dikoreksi), lalu satu gambar kondisi, atau tiga langkah (kondisi, hack, permanen) bila hand shower ditandai
 * perlu perhatian. Gambar hanya ilustrasi: tidak ada angka ukuran.
 */
export function PanelShower({
  varian,
  onUbahVarian,
  perhatian,
  dariFoto,
  bisaGanti,
}: {
  varian: VarianShower;
  onUbahVarian: (v: VarianShower) => void;
  perhatian: boolean;
  dariFoto: boolean;
  /** Pilihan jenis hanya ditampilkan bila jenisnya belum terbaca (tidak jelas atau dari ceklis manual). */
  bisaGanti: boolean;
}) {
  const langkah = langkahGambarShower(varian, perhatian);
  const petunjuk = bisaGanti
    ? varian === "tidak_jelas"
      ? p.petunjukJenis
      : null
    : dariFoto
      ? p.terbacaDariFoto.replace("{nama}", p.nama[varian])
      : null;
  return (
    <div className="mt-3 flex flex-col gap-3 border-t border-garis/70 pt-3">
      <div>
        <p className="font-semibold">{p.judul}</p>
        {petunjuk && <p className="text-kecil text-redup">{petunjuk}</p>}
      </div>
      {bisaGanti && (
        <div role="radiogroup" aria-label={p.judul} className="flex flex-wrap gap-2">
          {VARIAN_SHOWER.map((v) => (
            <PilihanPil key={v} nama="varian-shower" label={p.nama[v]} aktif={varian === v} onUbah={() => onUbahVarian(v)} />
          ))}
        </div>
      )}
      {langkah.length === 1 && (
        <Langkah mode="kondisi" varian={varian} anotasi={false} teks={konten.ui.pindai.gambarShower[`${varian}_kondisi`]} />
      )}
      {langkah.length > 1 && (
        <Lipat judul={p.lihatContoh} className="">
          <div className="flex flex-col gap-5">
            {langkah.map((mode, i) => (
              <Langkah key={mode} nomor={i + 1} mode={mode} varian={varian} anotasi />
            ))}
            <p className="text-kecil text-redup">{p.istilah}</p>
            <p className="text-kecil text-redup">{p.catatanGambar}</p>
          </div>
        </Lipat>
      )}
    </div>
  );
}
