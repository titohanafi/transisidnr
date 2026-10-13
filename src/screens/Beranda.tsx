import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { CheckIn } from "../components/CheckIn";
import { Halaman } from "../components/Halaman";
import { IkonBeranda } from "../components/IkonBeranda";
import { TombolLink } from "../components/Tombol";
import { konten } from "../domain/content";

const { app, beranda, umum } = konten.ui;
const { pilih } = beranda;

export function Beranda() {
  return (
    <Halaman judul={app.nama}>
      <p className="mt-2 text-lg">{beranda.konteks}</p>

      <h2 className="sr-only">{pilih.judul}</h2>

      {/* Dua jalur: dipandu (utama), atau langsung ke yang dicari. */}
      <section className="mt-4 rounded-kartu bg-utama p-4 text-white" aria-labelledby="jalur-susun">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-utama">
          <IkonBeranda kunci="rencana" />
        </span>
        <h3 id="jalur-susun" className="mt-3 text-xl font-bold leading-snug">
          {pilih.susun.judul}
        </h3>
        <p className="mt-1">{pilih.susun.deskripsi}</p>
        <Link
          to="/mulai/1"
          className="mt-3 inline-flex min-h-sentuh w-full items-center justify-center rounded-tombol bg-white px-5 py-2 text-base font-semibold text-utama-gelap hover:bg-utama-muda"
        >
          {pilih.susun.tombol}
        </Link>
      </section>

      <section className="mt-5" aria-labelledby="jalur-tahu">
        <h3 id="jalur-tahu" className="sr-only">
          {pilih.tahu.judul}
        </h3>
        <div className="grid grid-cols-3 gap-2">
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
        <TombolLink to="/jelajah" gayaTombol="sekunder" className="mt-3 w-full">
          {pilih.tahu.semua}
        </TombolLink>
      </section>

      <section className="mt-5">
        <CheckIn />
      </section>

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
      <IkonBeranda kunci={ikon} className="h-8 w-8" />
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
