import { Info, Search, UsersRound, Wrench } from "lucide-react";
import { useState } from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";
import { DaftarAlat } from "../components/DaftarAlat";
import { Halaman } from "../components/Halaman";
import { BarisTautan } from "../components/BarisTautan";
import { KartuBaris } from "../components/KartuBaris";
import { KartuKerangka } from "../components/KartuKerangka";
import { Ikon } from "../components/Ikon";
import { TombolLink } from "../components/Tombol";
import { konten } from "../domain/content";
import { susunTingkat } from "../domain/engine";
import { cocokCari, cocokFilter, kelompokkan, kumpulkanAlat, type Filter } from "../domain/jelajah";
import { usePlaceholderBerjalan } from "../lib/placeholderBerjalan";
import { useRencana } from "../state/useRencana";

const { jelajah: t } = konten.ui;
const FILTER: Filter[] = ["semua", "alat"];

// Jalur pintas: langsung ke panduan dan aksinya tanpa mengisi pertanyaan.
// Alamat /jelajah/alat membuka daftar alat. /jelajah/ahli dan /jelajah/tukang (alamat lama) menuju halaman Kontak.
export function Jelajah() {
  const { filter } = useParams();
  if (filter === "ahli" || filter === "tukang") return <Navigate to="/kontak" replace />;
  const awal = FILTER.find((f) => f === filter) ?? "semua";
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

  // Kolom cari ada di dalam pita kepala gelap (hanya di daftar semua panduan).
  const kolomCari = (
    <div className="-mt-5">
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
          className="h-12 w-full rounded-tombol border border-garis bg-white pl-11 pr-3 text-isi shadow-kartu placeholder:text-redup"
        />
      </div>
    </div>
  );

  return (
    <Halaman
      judul={t.judulFilter[filter]}
      judulTersembunyi={filter === "semua"}
      kepala={filter === "semua" ? kolomCari : <p className="mt-2 text-redup">{t.pengantarFilter[filter]}</p>}
      kepalaPita={filter === "semua" ? "gelap" : false}
      kepalaTumpang={filter === "semua"}
    >
      <div className={filter === "semua" ? "-mt-9" : undefined}>
        {filter === "semua" && cari.trim() !== "" && (
          <aside className="mb-bagian flex items-start gap-2 rounded-kartu border border-catatan-garis bg-catatan-muda p-3 text-catatan">
            <Info className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={2} aria-hidden="true" focusable="false" />
            <p className="text-kecil">{t.cari.cakupan}</p>
          </aside>
        )}

        {filter === "alat" ? (
          <DaftarAlat alat={alat} />
        ) : (
          <>
            <div aria-live="polite">
              {kelompok.length === 0 && (
                <p className="mt-5 rounded-kartu bg-draf-muda p-4 text-draf">{cari.trim() ? t.cari.kosong : t.kosongFilter}</p>
              )}
            </div>

            {kelompok.map((g) => (
              <section
                key={g.kunci}
                className="mt-bagian overflow-hidden rounded-kartu border border-garis/70 bg-white shadow-kartu first-of-type:mt-0"
                aria-labelledby={`grup-${g.kunci}`}
              >
                <h2 id={`grup-${g.kunci}`} className="flex items-center gap-3 p-4 text-judulKartu">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-tombol bg-utama-muda">
                    <Ikon kunci={g.kunci} className="h-6 w-6" />
                  </span>
                  {label(g.kunci)}
                </h2>
                <ul className="divide-y divide-garis/60 border-t border-garis/60">
                  {g.kartu.map((k) => (
                    <li key={k.id}>{k.isi_menyusul ? <KartuKerangka kartu={k} /> : <KartuBaris kartu={k} />}</li>
                  ))}
                </ul>
              </section>
            ))}
          </>
        )}

        {filter === "semua" ? (
          <nav aria-label={t.lainnya.judul} className="mt-bagian">
            <ul className="space-y-3">
              {[
                { ke: "/jelajah/alat", teks: t.lainnya.alat, Ikon: Wrench },
                { ke: "/kontak", teks: t.lainnya.ahli, Ikon: UsersRound },
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
      </div>
    </Halaman>
  );
}
