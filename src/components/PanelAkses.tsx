import { konten } from "../domain/content";
import type { ModeGambar } from "../domain/gambarShower";
import { GambarAkses } from "./GambarAkses";
import { Lipat } from "./Lipat";

const p = konten.ui.pindai.panelAkses;
const LANGKAH: ModeGambar[] = ["kondisi", "hack", "permanen"];
const LENCANA: Record<ModeGambar, string> = {
  kondisi: "border-2 border-dashed border-tinta",
  hack: "border-2 border-tinta",
  permanen: "border-2 border-tinta bg-tinta text-white",
};

/**
 * Contoh perbaikan akses mandi (bak mandi tembok yang terhalang bibir): kondisi, hack tanpa bongkar, dan permanen.
 * Hanya ditampilkan bila hal "area mandi" ditandai perlu perhatian. Gambar hanya ilustrasi, tanpa angka ukuran.
 */
export function PanelAkses() {
  return (
    <div className="mt-3 flex flex-col gap-3 border-t border-garis/70 pt-3">
      <div>
        <p className="font-semibold">{p.judul}</p>
        <p className="text-kecil text-redup">{p.penjelasan}</p>
      </div>
      <Lipat judul={p.lihatContoh} className="">
        <div className="flex flex-col gap-5">
          {LANGKAH.map((mode, i) => {
            const l = p.langkah[mode];
            return (
              <figure key={mode} className="m-0 flex flex-col gap-2">
                <figcaption className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-tombol border-2 border-tinta text-judulKartu font-bold">
                    {i + 1}
                  </span>
                  <span className={`rounded px-2 py-0.5 text-mikro font-bold uppercase tracking-wide ${LENCANA[mode]}`}>{l.label}</span>
                  <span className="text-kecil text-redup">{l.sub}</span>
                </figcaption>
                <GambarAkses mode={mode} className="mx-auto w-full max-w-[20rem] rounded-tombol border border-garis" />
                <p className="text-kecil">{l.isi}</p>
              </figure>
            );
          })}
          <p className="text-kecil text-redup">{p.catatanGambar}</p>
        </div>
      </Lipat>
    </div>
  );
}
