import { Link } from "react-router-dom";
import { konten } from "../domain/content";
import type { KartuRencana, TingkatRencana } from "../domain/engine";
import { Ikon } from "./Ikon";
import { kunciKelompok } from "../domain/jelajah";
import { LencanaSifat, LencanaStatus, Tanda } from "./Lencana";
import { aksiUtama } from "../domain/aksi";
import { TombolAksi } from "./TombolAksi";
import { KartuKerangka } from "./KartuKerangka";
import { tingkatBerikutnya } from "../domain/hasil";
import { useStore } from "../state/store";

const { rencana: tr, umum, kartu: tk } = konten.ui;

/** Tingkat untuk tombol utama: yang ditonjolkan (kontrakan/kos), kalau tidak yang pertama tampil. */
export function tingkatUtama(k: KartuRencana): TingkatRencana | undefined {
  const tampil = k.tingkat.filter((t) => t.tampil);
  return tampil.find((t) => t.ditonjolkan) ?? tampil[0];
}

export function KartuRingkas({ kartu, judulTingkat = "h3" }: { kartu: KartuRencana; judulTingkat?: "h2" | "h3" }) {
  const { state } = useStore();
  const data = konten.kartu.find((k) => k.id === kartu.id);
  if (!data) return null;
  if (kartu.isiMenyusul) {
    return (
      <div className="overflow-hidden rounded-kartu border border-garis/70 bg-white shadow-kartu">
        <KartuKerangka kartu={data} />
      </div>
    );
  }
  const Judul = judulTingkat;
  const h = state.hasil[kartu.id];
  const berikut = h?.status === "masih_sulit" ? tingkatBerikutnya(kartu, h.tingkat) : undefined;
  const utama = (berikut && kartu.tingkat.find((t) => t.tingkat === berikut)) || tingkatUtama(kartu);

  return (
    <article className="rounded-kartu border border-garis/70 bg-white p-4 shadow-kartu">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-tombol bg-utama-muda">
          <Ikon kunci={kunciKelompok(data)} className="h-7 w-7" />
        </span>
        <Judul className="text-judulKartu">{data.judul}</Judul>
      </div>
      <div className="mt-2 flex flex-wrap gap-2 empty:hidden">
        <LencanaStatus status={data.status_validasi} />
      </div>
      {h?.status === "masih_sulit" && (
        <p className="mt-2">
          <Tanda>{tr.perluLagi}</Tanda>
        </p>
      )}
      <p className="mt-2 text-redup">{data.situasi}</p>

      {kartu.isiMenyusul ? (
        <p className="mt-3 font-medium">{umum.isiMenyusul}</p>
      ) : (
        <ul className="mt-3 space-y-2" aria-label={tk.solusi}>
          {kartu.tingkat
            .filter((t) => t.tampil)
            .map((t, i) => (
              <li key={t.tingkat} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-tombol bg-permukaan px-3 py-2.5">
                <span
                  aria-hidden="true"
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-utama-redup bg-white text-kecil font-semibold text-utama-gelap"
                >
                  {i + 1}
                </span>
                <p className="font-semibold">{tk.tingkat[t.tingkat]}</p>
                <div className="flex flex-wrap gap-2 empty:hidden">
                  <LencanaSifat sifat={t.sifat} />
                  {t.ditandaiPermanen && <Tanda>{umum.menunggu}</Tanda>}
                  {t.ditonjolkan && <Tanda>{tr.cocokSewa}</Tanda>}
                  {t.diAtasBudget && <Tanda>{umum.diAtasBudget}</Tanda>}
                </div>
              </li>
            ))}
        </ul>
      )}

      <div className="mt-4 border-t border-garis/60 pt-4">
        {utama ? (
          <TombolAksi
            jenis={aksiUtama(utama.tingkat, data.solusi?.[utama.tingkat]?.barang.length ?? 0)}
            kartuId={kartu.id}
            tingkat={utama.tingkat}
            judulKartu={data.judul}
            className="w-full"
          />
        ) : (
          <Link to={`/kartu/${kartu.id}`} className="inline-flex min-h-sentuh items-center text-utama underline">
            {tr.bukaKartu}
            <span className="sr-only">: {data.judul}</span>
          </Link>
        )}
      </div>
    </article>
  );
}
