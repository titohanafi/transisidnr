import { useState } from "react";
import { useParams } from "react-router-dom";
import { DaftarAhli } from "../components/DaftarAhli";
import { DaftarAlat } from "../components/DaftarAlat";
import { Halaman } from "../components/Halaman";
import { KartuBaris } from "../components/KartuBaris";
import { PilihanPil } from "../components/Pilihan";
import { KartuKerangka } from "../components/KartuKerangka";
import { Ikon } from "../components/Ikon";
import { LencanaStatus, Tanda } from "../components/Lencana";
import { TombolAksi } from "../components/TombolAksi";
import { TombolLink } from "../components/Tombol";
import { konten } from "../domain/content";
import { susunTingkat } from "../domain/engine";
import {
  aksiKartu,
  aksiUntukFilter,
  cocokFilter,
  kelompokkan,
  kumpulkanAhli,
  kumpulkanAlat,
  type Filter,
} from "../domain/jelajah";
import { useRencana } from "../state/useRencana";
import { useStore } from "../state/store";

const { jelajah: t, umum, rencana: tr } = konten.ui;
const FILTER: Filter[] = ["semua", "alat", "tukang", "ahli"];

// Jalur pintas: langsung ke panduan dan aksinya tanpa mengisi pertanyaan.
// Alamat /jelajah/alat, /jelajah/tukang, dan /jelajah/ahli membuka daftar yang sudah disaring.
export function Jelajah() {
  const { filter } = useParams();
  const awal = FILTER.find((f) => f === filter) ?? "semua";
  return <Daftar key={awal} awal={awal} />;
}

function Daftar({ awal }: { awal: Filter }) {
  const { state } = useStore();
  const { konteks } = useRencana();
  const [filter, setFilter] = useState<Filter>(awal);

  const adaJawaban = Object.keys(state.asesmen.status).length > 0;
  const label = (kunci: string) =>
    kunci === "caregiver"
      ? t.caregiver
      : (konten.asesmen.aktivitas
          .find((a) => a.id === kunci)
          ?.label.split(" (")[0] ?? kunci);

  const tingkatDari = (id: string) => {
    const k = konten.kartu.find((x) => x.id === id)!;
    return susunTingkat(k, konteks);
  };

  const kelompok = kelompokkan(
    konten.kartu.filter((k) =>
      cocokFilter(
        k,
        tingkatDari(k.id)
          .filter((x) => x.tampil)
          .map((x) => x.tingkat),
        filter,
      ),
    ),
    konten.asesmen.aktivitas.map((a) => a.id),
  );

  const tampilDari = (k: (typeof konten.kartu)[number]) =>
    tingkatDari(k.id)
      .filter((x) => x.tampil)
      .map((x) => x.tingkat);
  const alat = kumpulkanAlat(
    konten.kartu.filter((k) => !k.isi_menyusul),
    tampilDari,
  );
  const ahli = kumpulkanAhli(konten.kartu);

  return (
    <Halaman judul={t.judulFilter[filter]}>
      <p className="mt-2 text-redup">{t.pengantarFilter[filter]}</p>

      {awal === "semua" && (
        <div
          role="radiogroup"
          aria-label={t.filterLabel}
          className="mt-4 flex flex-wrap gap-2"
        >
          {FILTER.map((f) => (
            <PilihanPil
              key={f}
              nama="filter"
              label={t.filter[f]}
              aktif={filter === f}
              onUbah={() => setFilter(f)}
            />
          ))}
        </div>
      )}

      {filter === "alat" ? (
        <DaftarAlat alat={alat} />
      ) : filter === "ahli" ? (
        <DaftarAhli ahli={ahli} />
      ) : (
        <>
          <div aria-live="polite">
            {kelompok.length === 0 && (
              <p className="mt-5 rounded-kartu bg-draf-muda p-3 text-draf">
                {t.kosongFilter}
              </p>
            )}
          </div>

          {kelompok.map((g) => (
            <section
              key={g.kunci}
              className="mt-6"
              aria-labelledby={`grup-${g.kunci}`}
            >
              <h2
                id={`grup-${g.kunci}`}
                className="flex items-center gap-3 text-xl font-bold"
              >
                <Ikon kunci={g.kunci} className="h-9 w-9" />
                {label(g.kunci)}
              </h2>
              <div className="mt-3 space-y-3">
                {g.kartu.map((k) => {
                  const tingkat = tingkatDari(k.id);
                  const aksi = aksiUntukFilter(
                    aksiKartu(
                      k,
                      tingkat.filter((x) => x.tampil).map((x) => x.tingkat),
                    ),
                    filter,
                  );
                  if (k.isi_menyusul)
                    return <KartuKerangka key={k.id} kartu={k} />;
                  if (aksi.length === 0)
                    return <KartuBaris key={k.id} kartu={k} />;
                  return (
                    <article
                      key={k.id}
                      className="rounded-kartu border border-garis bg-white p-4"
                    >
                      <h3 className="text-lg font-semibold leading-snug">
                        {k.judul}
                      </h3>
                      <div className="mt-2 empty:hidden">
                        <LencanaStatus status={k.status_validasi} />
                      </div>
                      <p className="mt-2 text-redup">{k.situasi}</p>

                      {k.isi_menyusul ? (
                        <p className="mt-3 font-medium">{umum.isiMenyusul}</p>
                      ) : (
                        aksi.length > 0 && (
                          <ul
                            className="mt-3 space-y-2"
                            aria-label={t.aksiKartu}
                          >
                            {aksi.map((a) => {
                              const tanda = a.tingkat
                                ? tingkat.find((x) => x.tingkat === a.tingkat)
                                : undefined;
                              return (
                                <li key={a.jenis}>
                                  <TombolAksi
                                    jenis={a.jenis}
                                    kartuId={k.id}
                                    tingkat={a.tingkat}
                                    judulKartu={k.judul}
                                    gayaTombol="utama"
                                    className="w-full"
                                  />
                                  {tanda?.ditandaiPermanen && (
                                    <p className="mt-1">
                                      <Tanda>{umum.menunggu}</Tanda>
                                    </p>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        )
                      )}

                      <TombolLink
                        to={`/kartu/${k.id}`}
                        gayaTombol={aksi.length > 0 ? "sekunder" : "utama"}
                        className="mt-3 w-full"
                      >
                        {tr.bukaKartu}
                        <span className="sr-only">: {k.judul}</span>
                      </TombolLink>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </>
      )}

      <section
        className="mt-8 rounded-kartu border border-garis bg-white p-3"
        aria-label={umum.keBeranda}
      >
        <p>{adaJawaban ? t.ajakanSudah : t.ajakanBelum}</p>
        <TombolLink
          to={adaJawaban ? "/rencana" : "/mulai/1"}
          gayaTombol="sekunder"
          className="mt-2 w-full"
        >
          {adaJawaban ? t.ajakanRencana : t.ajakanMulai}
        </TombolLink>
      </section>

      <TombolLink to="/" gayaTombol="sekunder" className="mt-4">
        {umum.keBeranda}
      </TombolLink>
    </Halaman>
  );
}
