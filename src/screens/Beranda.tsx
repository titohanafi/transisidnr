import { Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { CheckIn } from "../components/CheckIn";
import { Halaman } from "../components/Halaman";
import { IkonBeranda } from "../components/IkonBeranda";
import { konten } from "../domain/content";
import { useStore } from "../state/store";

const { app, beranda } = konten.ui;
const { pilih } = beranda;

// Satu tindakan utama: belum menjawab -> buat rencana; sudah -> lanjutkan rencana.
export function Beranda() {
  const { state } = useStore();
  const navigate = useNavigate();
  const adaJawaban = Object.keys(state.asesmen.status).length > 0;
  const kartu = adaJawaban ? pilih.lanjut : pilih.susun;

  return (
    <Halaman judul={app.nama}>
      <h2 className="sr-only">{pilih.judul}</h2>

      <form
        role="search"
        className="mt-4"
        onSubmit={(e) => {
          e.preventDefault();
          const q = new FormData(e.currentTarget).get("q");
          navigate("/jelajah", { state: { cari: typeof q === "string" ? q.trim() : "" } });
        }}
      >
        <label htmlFor="cari-beranda" className="text-sm font-semibold text-redup">
          {pilih.cari.label}
        </label>
        <div className="mt-1 flex gap-2">
          <input
            id="cari-beranda"
            name="q"
            type="search"
            autoComplete="off"
            enterKeyHint="search"
            placeholder={pilih.cari.placeholder}
            className="min-h-sentuh min-w-0 flex-1 rounded-tombol border-2 border-garisKontrol bg-white px-3 text-base"
          />
          <button
            type="submit"
            aria-label={pilih.cari.tombol}
            className="inline-flex h-sentuh w-sentuh shrink-0 items-center justify-center rounded-tombol border-2 border-utama bg-white text-utama"
          >
            <Search className="h-5 w-5" strokeWidth={2.5} aria-hidden="true" focusable="false" />
          </button>
        </div>
      </form>

      <section className="mt-4 rounded-kartu bg-utama p-4 text-white" aria-labelledby="jalur-utama">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-utama">
          <IkonBeranda kunci="rencana" />
        </span>
        <h3 id="jalur-utama" className="mt-3 text-xl font-bold leading-snug">
          {kartu.judul}
        </h3>
        <p className="mt-1">{kartu.deskripsi}</p>
        <Link
          to={adaJawaban ? "/rencana" : "/mulai/1"}
          className="mt-3 inline-flex min-h-sentuh w-full items-center justify-center rounded-tombol bg-white px-5 py-2 text-base font-semibold text-utama-gelap hover:bg-utama-muda"
        >
          {kartu.tombol}
        </Link>
      </section>

      <Link to="/jelajah" className="mt-2 inline-flex min-h-sentuh items-center text-utama underline">
        {pilih.semua}
      </Link>


      <section className="mt-3">
        <CheckIn />
      </section>
    </Halaman>
  );
}
