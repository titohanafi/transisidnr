import { Info, Search, UsersRound, Wrench } from "lucide-react";
import { useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { DaftarAhli } from "../components/DaftarAhli";
import { DaftarAlat } from "../components/DaftarAlat";
import { Halaman } from "../components/Halaman";
import { BarisTautan } from "../components/BarisTautan";
import { KartuBaris } from "../components/KartuBaris";
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
  cocokCari,
  cocokFilter,
  kelompokkan,
  kumpulkanAhli,
  kumpulkanAlat,
  type Filter,
} from "../domain/jelajah";
import { usePlaceholderBerjalan } from "../lib/placeholderBerjalan";
import { useRencana } from "../state/useRencana";

const { jelajah: t, umum, rencana: tr } = konten.ui;
const FILTER: Filter[] = ["semua", "alat", "ahli"];

// Jalur pintas: langsung ke panduan dan aksinya tanpa mengisi pertanyaan.
// Alamat /jelajah/alat dan /jelajah/ahli membuka daftar yang sudah disaring. /jelajah/tukang (alamat lama) menuju ahli.
export function Jelajah() {
  const { filter } = useParams();
  const awal = FILTER.find((f) => f === (filter === "tukang" ? "ahli" : filter)) ?? "semua";
  return <Daftar key={awal} awal={awal} />;
}

function Daftar({ awal }: { awal: Filter }) {
  const { konteks } = useRencana();
  const filter: Filter = awal;
  // Kata kunci bisa datang dari kolom cari di Beranda (lewat state riwayat, bukan alamat).
  const dariBeranda = (useLocation().state as { cari?: string } | null)?.cari;
  const [cari, setCari] = useState(dariBeranda ?? "");
  const [fokus, setFokus] = useState(false);
  const placeholder = usePlaceholderBerjalan(t.cari.contoh, !fokus && cari === "");

  const label = (kunci: string) =>
    kunci === "caregiver" ? t.caregiver : (konten.asesmen.aktivitas.find((a) => a.id === kunci)?.label.split(" (")[0] ?? kunci);

  const tingkatDari = (id: string) => {
    const k = konten.kartu.find((x) => x.id === id)!;
    return susunTingkat(k, konteks);
  };

  const kelompok = kelompokkan(
    konten.kartu
      .filter((k) => cocokCari(k, filter === "semua" ? cari : ""))
      .filter((k) =>
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
    <Halaman
      judul={t.judulFilter[filter]}
      judulTersembunyi={filter === "semua"}
      kepala={
        <>
          {filter !== "semua" && <p className="mt-2 text-redup">{t.pengantarFilter[filter]}</p>}
          {filter === "semua" && (
            <div>
              <label htmlFor="cari-panduan" className="sr-only">
                {t.cari.label}
              </label>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-redup"
                  strokeWidth={2}
                  aria-hidden="true"
                  focusable="false"
                />
                <input
                  id="cari-panduan"
                  type="search"
                  value={cari}
                  onChange={(e) => setCari(e.target.value)}
                  autoComplete="off"
                  enterKeyHint="search"
                  placeholder={placeholder}
                  onFocus={() => setFokus(true)}
                  onBlur={() => setFokus(false)}
                  autoFocus={dariBeranda === ""}
                  className="h-12 w-full rounded-tombol border border-garisKontrol bg-white pl-11 pr-3 text-isi shadow-kartu placeholder:text-redup"
                />
              </div>
            </div>
          )}
        </>
      }
    >
      {filter === "semua" && cari.trim() !== "" && (
        <aside className="flex items-start gap-2 rounded-kartu border border-catatan-garis bg-catatan-muda p-3 text-catatan">
          <Info className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={2} aria-hidden="true" focusable="false" />
          <p className="text-kecil">{t.cari.cakupan}</p>
        </aside>
      )}

      {filter === "alat" ? (
        <DaftarAlat alat={alat} />
      ) : filter === "ahli" ? (
        <DaftarAhli ahli={ahli} />
      ) : (
        <>
          <div aria-live="polite">
            {kelompok.length === 0 && (
              <p className="mt-5 rounded-kartu bg-draf-muda p-4 text-draf">{cari.trim() ? t.cari.kosong : t.kosongFilter}</p>
            )}
          </div>

          {kelompok.map((g) => (
            <section key={g.kunci} className="mt-bagian first:mt-0" aria-labelledby={`grup-${g.kunci}`}>
              <h2 id={`grup-${g.kunci}`} className="flex items-center gap-3 text-subjudul">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-tombol bg-utama-muda">
                  <Ikon kunci={g.kunci} className="h-6 w-6" />
                </span>
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
                  if (k.isi_menyusul) return <KartuKerangka key={k.id} kartu={k} />;
                  if (aksi.length === 0) return <KartuBaris key={k.id} kartu={k} />;
                  return (
                    <article key={k.id} className="rounded-kartu border border-garis/70 bg-white p-5 shadow-kartu">
                      <h3 className="text-judulKartu">{k.judul}</h3>
                      <div className="mt-2 empty:hidden">
                        <LencanaStatus status={k.status_validasi} />
                      </div>
                      <p className="mt-2 text-redup">{k.situasi}</p>

                      {k.isi_menyusul ? (
                        <p className="mt-3 font-medium">{umum.isiMenyusul}</p>
                      ) : (
                        aksi.length > 0 && (
                          <ul className="mt-3 space-y-2" aria-label={t.aksiKartu}>
                            {aksi.map((a) => {
                              const tanda = a.tingkat ? tingkat.find((x) => x.tingkat === a.tingkat) : undefined;
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

                      <TombolLink to={`/kartu/${k.id}`} gayaTombol={aksi.length > 0 ? "sekunder" : "utama"} className="mt-3 w-full">
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

      {filter === "semua" ? (
        <nav aria-label={t.lainnya.judul} className="mt-jeda">
          <h2 className="text-subjudul">{t.lainnya.judul}</h2>
          <ul className="mt-isi space-y-3">
            {[
              { ke: "/jelajah/alat", teks: t.lainnya.alat, Ikon: Wrench },
              { ke: "/jelajah/ahli", teks: t.lainnya.ahli, Ikon: UsersRound },
            ].map(({ ke, teks, Ikon: IkonBaris }) => (
              <li key={ke}>
                <BarisTautan ke={ke} teks={teks} Ikon={IkonBaris} />
              </li>
            ))}
          </ul>
        </nav>
      ) : (
        <TombolLink to="/jelajah" gayaTombol="sekunder" className="mt-jeda w-full">
          {t.semuaPanduan}
        </TombolLink>
      )}

      <TombolLink to="/" gayaTombol="sekunder" className="mt-4">
        {umum.keBeranda}
      </TombolLink>
    </Halaman>
  );
}
