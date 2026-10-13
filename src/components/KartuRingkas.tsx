import { Link } from "react-router-dom";
import { konten } from "../domain/content";
import type { KartuRencana, TingkatRencana } from "../domain/engine";
import { LencanaSifat, LencanaStatus, Tanda } from "./Lencana";
import { aksiUtama } from "../domain/aksi";
import { TombolAksi } from "./TombolAksi";

const { rencana: tr, umum, kartu: tk } = konten.ui;

/** Tingkat untuk tombol utama: yang ditonjolkan (kontrakan/kos), kalau tidak yang pertama tampil. */
export function tingkatUtama(k: KartuRencana): TingkatRencana | undefined {
  const tampil = k.tingkat.filter((t) => t.tampil);
  return tampil.find((t) => t.ditonjolkan) ?? tampil[0];
}

export function KartuRingkas({ kartu, judulTingkat = "h3" }: { kartu: KartuRencana; judulTingkat?: "h2" | "h3" }) {
  const data = konten.kartu.find((k) => k.id === kartu.id);
  if (!data) return null;
  const Judul = judulTingkat;
  const utama = tingkatUtama(kartu);

  return (
    <article className="rounded-kartu border border-garis bg-white p-4">
      <Judul className="text-lg font-semibold leading-snug">{data.judul}</Judul>
      <div className="mt-2 flex flex-wrap gap-2">
        <LencanaStatus status={data.status_validasi} />
      </div>
      <p className="mt-2 text-redup">{data.situasi}</p>

      {kartu.isiMenyusul ? (
        <p className="mt-3 font-medium">{umum.isiMenyusul}</p>
      ) : (
        <ul className="mt-3 space-y-2" aria-label={tk.solusi}>
          {kartu.tingkat
            .filter((t) => t.tampil)
            .map((t) => (
              <li key={t.tingkat} className="rounded-tombol bg-kertas p-2">
                <p className="font-medium">{tk.tingkat[t.tingkat]}</p>
                <div className="mt-1 flex flex-wrap gap-2">
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
