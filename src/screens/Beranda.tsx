import { Info, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { CheckIn } from "../components/CheckIn";
import { Halaman } from "../components/Halaman";
import { IkonBeranda } from "../components/IkonBeranda";
import { konten } from "../domain/content";
import { bagianHari } from "../lib/tanggal";
import { useStore } from "../state/store";

const { app, beranda } = konten.ui;
const { pilih } = beranda;

// Info cakupan layanan. Pengunjung baru melihatnya sebagai banner di atas; yang sudah menjawab
// melihatnya sebagai catatan kecil di dasar halaman agar bagian atas dipakai untuk aksinya.
function Cakupan({ banner }: { banner: boolean }) {
  const isi = (
    <>
      <Info className="mt-0.5 h-5 w-5 shrink-0 text-info" strokeWidth={2} aria-hidden="true" focusable="false" />
      <p className="text-kecil text-tinta">
        {pilih.cakupan}{" "}
        <Link to="/jelajah" className="whitespace-nowrap py-2 font-semibold text-info underline">
          {pilih.semua}
        </Link>
      </p>
    </>
  );
  return banner ? (
    <aside className="-mx-4 -mt-5 flex items-start gap-2 border-b border-info/25 bg-info-muda px-4 py-3">{isi}</aside>
  ) : (
    <aside className="flex items-start gap-2 rounded-kartu bg-info-muda px-3 py-3">{isi}</aside>
  );
}

// Satu tindakan utama: belum menjawab -> cek kebutuhan; sudah -> lanjutkan panduan. Urutan mengikuti keadaan pengguna.
export function Beranda() {
  const { state } = useStore();
  const navigate = useNavigate();
  const adaJawaban = Object.keys(state.asesmen.status).length > 0;
  const kartu = adaJawaban ? pilih.lanjut : pilih.susun;

  const sapaan = (kelas: string) => <p className={`text-isi font-semibold text-utama ${kelas}`}>{beranda.sapaan[bagianHari()]}</p>;

  const cari = (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const q = new FormData(e.currentTarget).get("q");
        navigate("/jelajah", { state: { cari: typeof q === "string" ? q.trim() : "" } });
      }}
    >
      <label htmlFor="cari-beranda" className="text-judul text-tinta">
        {pilih.cari.label}
      </label>
      <div className="relative mt-isi">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-redup"
          strokeWidth={2.5}
          aria-hidden="true"
          focusable="false"
        />
        <input
          id="cari-beranda"
          name="q"
          type="search"
          autoComplete="off"
          enterKeyHint="search"
          placeholder={pilih.cari.placeholder}
          className="h-12 w-full rounded-tombol border-2 border-garisKontrol bg-white pl-11 pr-3 text-isi"
        />
      </div>
      <button type="submit" className="sr-only">
        {pilih.cari.tombol}
      </button>
      <div className="mt-isi">
        <p id="saran-cari" className="text-kecil text-redup">
          {pilih.cari.saranJudul}
        </p>
        <ul aria-labelledby="saran-cari" className="mt-1 flex flex-wrap gap-2">
          {pilih.cari.saran.map((k) => (
            <li key={k}>
              <button
                type="button"
                onClick={() => navigate("/jelajah", { state: { cari: k } })}
                className="tekan inline-flex min-h-sentuh items-center rounded-full border-2 border-garisKontrol bg-white px-3 text-kecil font-semibold text-tinta"
              >
                {k}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </form>
  );

  // Segmen pencarian selebar layar. Bagi pengunjung baru, kartu utama menimpa tepi bawahnya sekitar 40px.
  const segmenCari = (
    <div className={`-mx-4 bg-permukaan px-4 ${adaJawaban ? "py-5" : "pb-[72px] pt-5"}`}>
      {!adaJawaban && sapaan("mb-isi")}
      {cari}
    </div>
  );

  const utama = (
    <section
      className={`rounded-kartu bg-utama p-4 text-white ${adaJawaban ? "" : "relative -mt-16 shadow-sm"}`}
      aria-labelledby="jalur-utama"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-utama">
        <IkonBeranda kunci="rencana" />
      </span>
      <h3 id="jalur-utama" className="mt-isi text-subjudul">
        {kartu.judul}
      </h3>
      <p className="mt-1 text-isi">{kartu.deskripsi}</p>
      <Link
        to={adaJawaban ? "/rencana" : "/mulai/1"}
        className="tekan mt-isi inline-flex min-h-sentuh w-full items-center justify-center rounded-tombol bg-white px-5 py-2 text-isi font-semibold text-utama-gelap hover:bg-utama-muda"
      >
        {kartu.tombol}
      </Link>
    </section>
  );

  return (
    <Halaman judul={app.nama}>
      <h2 className="sr-only">{pilih.judul}</h2>

      {!adaJawaban && <Cakupan banner />}

      <div className="flex flex-col gap-bagian">
        {adaJawaban ? (
          <>
            {sapaan("-mb-isi")}
            {utama}
            {segmenCari}
          </>
        ) : (
          <>
            {segmenCari}
            {utama}
          </>
        )}
        <CheckIn />
        {adaJawaban && <Cakupan banner={false} />}
      </div>
    </Halaman>
  );
}
