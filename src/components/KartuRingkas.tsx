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
      <div className="flex items-start gap-3">
        <Ikon kunci={kunciKelompok(data)} className="mt-0.5 h-9 w-9" />
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
            .map((t) => (
              <li key={t.tingkat} className="rounded-tombol bg-permukaan p-3">
                <p className="font-medium">{tk.tingkat[t.tingkat]}</p>
                <div className="mt-1 flex flex-wrap gap-2 empty:hidden">
                  <LencanaSifat sifat={t.sifat} />
                  {t.ditandaiPermanen && <Tanda>{umum.menunggu}</Tanda>}
                  {t.ditonjolkan && <Tanda>{tr.cocokSewa}</Tanda>}
                  {t.diAtasBudget && <Tanda>{umum.diAtasBudget}</Tanda>}
                </div>
              </li>
            ))}
        </ul>
      )}

      <div className="mt-4">
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
