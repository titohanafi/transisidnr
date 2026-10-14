import { Info, Search, X } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckIn } from "../components/CheckIn";
import { Halaman } from "../components/Halaman";
import { IkonBeranda } from "../components/IkonBeranda";
import { konten } from "../domain/content";
import { bagianHari } from "../lib/tanggal";
import { useStore } from "../state/store";

const { app, beranda } = konten.ui;
const { pilih } = beranda;

// Satu tindakan utama: belum menjawab -> cek kebutuhan; sudah -> lanjutkan panduan. Urutan mengikuti keadaan pengguna.
export function Beranda() {
  const { state } = useStore();
  const navigate = useNavigate();
  const adaJawaban = Object.keys(state.asesmen.status).length > 0;
  const [cakupanTutup, setCakupanTutup] = useState(false);
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
          strokeWidth={2}
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
          className="h-12 w-full rounded-tombol border border-garisKontrol bg-white pl-11 pr-3 text-isi shadow-kartu"
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
                className="tekan inline-flex min-h-sentuh items-center rounded-full border border-garis bg-white px-3 text-kecil shadow-kartu font-semibold text-tinta"
              >
                {k}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </form>
  );

  // Catatan cakupan: kuning lembut, selebar isi (bukan tepi ke tepi), bisa ditutup. Muncul lagi saat halaman dimuat ulang.
  const cakupan = (kelas: string) =>
    !cakupanTutup && (
      <aside
        className={`flex items-start gap-2 rounded-kartu border border-catatan-garis bg-catatan-muda py-1 pl-3 pr-1 text-catatan ${kelas}`}
      >
        <Info className="mt-3 h-5 w-5 shrink-0" strokeWidth={2} aria-hidden="true" focusable="false" />
        <p className="flex-1 py-2.5 text-kecil">{pilih.cakupan}</p>
        <button
          type="button"
          onClick={() => setCakupanTutup(true)}
          aria-label={pilih.tutupCakupan}
          className="tekan inline-flex h-sentuh w-sentuh shrink-0 items-center justify-center rounded-tombol hover:bg-catatan-garis/40"
        >
          <X className="h-5 w-5" strokeWidth={2} aria-hidden="true" focusable="false" />
        </button>
      </aside>
    );

  // Segmen pencarian selebar layar. Bagi pengunjung baru, kartu utama menimpa tepi bawahnya sekitar 40px.
  const segmenCari = (
    <div className={`-mx-4 bg-permukaan px-4 ${adaJawaban ? "py-5" : "-mt-6 pb-[72px] pt-6"}`}>
      {!adaJawaban && cakupan("mb-isi")}
      {!adaJawaban && sapaan("mb-isi")}
      {cari}
    </div>
  );

  const utama = (
    <section
      className={`relative overflow-hidden rounded-kartu bg-utama p-5 text-white ${adaJawaban ? "" : "-mt-16 shadow-angkat"}`}
      aria-labelledby="jalur-utama"
    >
      {/* Hiasan: lingkaran teal lebih gelap dari latar kartu, jadi tidak pernah menurunkan kontras teks di atasnya. */}
      <span aria-hidden="true" className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-utama-gelap/40" />
      <span aria-hidden="true" className="pointer-events-none absolute -right-2 -top-20 h-32 w-32 rounded-full bg-utama-gelap/30" />
      <span aria-hidden="true" className="pointer-events-none absolute -bottom-16 -left-10 h-36 w-36 rounded-full bg-utama-gelap/30" />

      <div className="relative flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-daun">
          <IkonBeranda kunci={adaJawaban ? "lanjut" : "susun"} className="h-6 w-6 text-white" />
        </span>
        <h3 id="jalur-utama" className="text-judulKartu font-bold">
          {kartu.judul}
        </h3>
      </div>
      <p className="relative mt-1.5 text-isi text-utama-redup">{kartu.deskripsi}</p>
      <Link
        to={adaJawaban ? "/rencana" : "/mulai/1"}
        className="tekan relative mt-5 inline-flex min-h-sentuh w-full items-center justify-center rounded-tombol bg-white px-5 py-2 text-isi font-semibold text-utama-gelap hover:bg-utama-muda"
      >
        {kartu.tombol}
      </Link>
    </section>
  );

  return (
    <Halaman judul={app.nama}>
      <h2 className="sr-only">{pilih.judul}</h2>

      <div className="flex flex-col gap-bagian">
        {adaJawaban ? (
          <>
            {cakupan("")}
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
      </div>
    </Halaman>
  );
}
