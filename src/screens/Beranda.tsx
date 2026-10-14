import { Link } from "react-router-dom";
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
  const adaJawaban = Object.keys(state.asesmen.status).length > 0;
  const kartu = adaJawaban ? pilih.lanjut : pilih.susun;

  return (
    <Halaman judul={app.nama}>
      {!adaJawaban && <p className="mt-2 text-lg">{beranda.pengantar}</p>}

      <h2 className="sr-only">{pilih.judul}</h2>

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
