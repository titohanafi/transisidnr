import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Halaman } from "../components/Halaman";
import { IkonAksi, IlustrasiBeranda } from "../components/Ikon";
import { konten } from "../domain/content";

const { app, beranda, umum } = konten.ui;
const { pilih } = beranda;

export function Beranda() {
  return (
    <Halaman judul={app.nama}>
      <IlustrasiBeranda className="mt-2" />

      <h2 className="sr-only">{pilih.judul}</h2>

      {/* Dua jalur: dipandu (utama), atau langsung ke yang dicari. */}
      <section className="mt-4 rounded-kartu bg-utama p-4 text-white" aria-labelledby="jalur-susun">
        <h3 id="jalur-susun" className="text-xl font-bold">
          {pilih.susun.judul}
        </h3>
        <p className="mt-1">{pilih.susun.isi}</p>
        <Link
          to="/mulai/1"
          className="mt-3 inline-flex min-h-sentuh w-full items-center justify-center rounded-tombol bg-white px-5 py-2 text-base font-semibold text-utama-gelap hover:bg-utama-muda"
        >
          {pilih.susun.tombol}
        </Link>
      </section>

      <section className="mt-5" aria-labelledby="jalur-tahu">
        <h3 id="jalur-tahu" className="font-semibold">
          {pilih.tahu.judul}
        </h3>
        <div className="mt-2 grid grid-cols-3 gap-2">
          <Ubin to="/jelajah/alat" ikon="alat">
            {pilih.tahu.alat}
          </Ubin>
          <Ubin to="/jelajah/tukang" ikon="tukang">
            {pilih.tahu.tukang}
          </Ubin>
          <Ubin to="/jelajah/ahli" ikon="ahli">
            {pilih.tahu.ahli}
          </Ubin>
        </div>
        <Link to="/jelajah" className="mt-1 inline-flex min-h-sentuh items-center text-utama underline">
          {pilih.tahu.semua}
        </Link>
      </section>

      <ol className="mt-4 flex gap-2" aria-label={beranda.caraKerja}>
        {beranda.langkah.map((l, i) => (
          <li key={l.judul} className="flex flex-1 flex-col items-center gap-1 text-center text-sm font-medium">
            <span aria-hidden="true" className="flex h-7 w-7 items-center justify-center rounded-full bg-utama-muda font-bold text-utama-gelap">
              {i + 1}
            </span>
            {l.judul}
          </li>
        ))}
      </ol>

      <p className="mt-5 text-sm text-redup">{umum.privasi}</p>

      <nav aria-label={umum.tautanLain} className="mt-auto flex flex-col pt-6">
        <TautanKecil to="/igd">{beranda.tautanIgd}</TautanKecil>
        <TautanKecil to="/hapus">{beranda.tautanHapus}</TautanKecil>
      </nav>
    </Halaman>
  );
}

function Ubin({ to, ikon, children }: { to: string; ikon: "alat" | "tukang" | "ahli"; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="flex min-h-sentuh flex-col items-center justify-center gap-1 rounded-kartu border-2 border-utama bg-white px-1 py-3 text-center text-sm font-semibold text-utama hover:bg-utama-muda"
    >
      <IkonAksi kunci={ikon} className="h-9 w-9" />
      {children}
    </Link>
  );
}

function TautanKecil({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="inline-flex min-h-sentuh items-center text-utama underline">
      {children}
    </Link>
  );
}
