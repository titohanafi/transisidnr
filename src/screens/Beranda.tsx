import { Info, Search, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckIn } from "../components/CheckIn";
import { Halaman } from "../components/Halaman";
import { IkonBeranda } from "../components/IkonBeranda";
import { KartuHero, TautanHero } from "../components/KartuHero";
import { konten } from "../domain/content";
import { usePlaceholderBerjalan } from "../lib/placeholderBerjalan";
import { bagianHari } from "../lib/tanggal";
import { useStore } from "../state/store";

const { app, beranda } = konten.ui;
const { pilih } = beranda;
const jc = konten.ui.jelajah.cari;

// Satu tindakan utama: belum menjawab -> cek kebutuhan; sudah -> lanjutkan panduan. Urutan mengikuti keadaan pengguna.
export function Beranda() {
  const { state } = useStore();
  const navigate = useNavigate();
  const adaJawaban = Object.keys(state.asesmen.status).length > 0;
  const [cakupanTutup, setCakupanTutup] = useState(false);
  const kartu = adaJawaban ? pilih.lanjut : pilih.susun;

  const sapaan = (kelas: string) => <p className={`text-isi font-semibold text-utama ${kelas}`}>{beranda.sapaan[bagianHari()]}</p>;

  const [fokus, setFokus] = useState(false);
  const [adaIsi, setAdaIsi] = useState(false);
  const placeholder = usePlaceholderBerjalan(jc.contoh, !fokus && !adaIsi);

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
        <input
          id="cari-beranda"
          name="q"
          type="search"
          autoComplete="off"
          enterKeyHint="search"
          placeholder={placeholder}
          onChange={(e) => setAdaIsi(e.target.value !== "")}
          onFocus={() => setFokus(true)}
          onBlur={() => setFokus(false)}
          className="h-12 w-full rounded-tombol border border-garis bg-white pl-4 pr-14 text-isi shadow-kartu placeholder:text-redup"
        />
        <button
          type="submit"
          aria-label={pilih.cari.tombol}
          className="tekan absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-tombol bg-daun text-utama-gelap hover:brightness-95"
        >
          <Search className="h-5 w-5" strokeWidth={2} aria-hidden="true" focusable="false" />
        </button>
      </div>
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

  // Segmen pencarian selebar layar, selalu di atas kartu utama. Kartu utama menimpa tepi bawahnya sekitar 40px, sebelum maupun sesudah asesmen diisi.
  const segmenCari = (
    <div className="-mx-4 -mt-6 bg-permukaan px-4 pb-[72px] pt-6">
      {cakupan("mb-isi")}
      {sapaan("mb-isi")}
      {cari}
    </div>
  );

  const utama = (
    <KartuHero
      id="jalur-utama"
      ikon={<IkonBeranda kunci={adaJawaban ? "lanjut" : "susun"} className="h-9 w-9 text-daun" />}
      judul={kartu.judul}
      className="-mt-16 shadow-angkat"
    >
      <p className="relative mt-2.5 text-isi text-utama-redup">{kartu.deskripsi}</p>
      <TautanHero to={adaJawaban ? "/rencana" : "/mulai/1"}>{kartu.tombol}</TautanHero>
    </KartuHero>
  );

  return (
    <Halaman judul={app.nama} latarPutih>
      <h2 className="sr-only">{pilih.judul}</h2>

      <div className="flex flex-col gap-bagian">
        {segmenCari}
        {utama}
        <CheckIn />
      </div>
    </Halaman>
  );
}
