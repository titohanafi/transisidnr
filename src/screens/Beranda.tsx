import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { CheckIn } from "../components/CheckIn";
import { Halaman } from "../components/Halaman";
import { ChevronRight } from "lucide-react";
import { IkonBeranda } from "../components/IkonBeranda";
import { konten } from "../domain/content";

const { app, beranda } = konten.ui;
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
        <div className="space-y-2">
          <BarisJalur to="/jelajah" ikon="panduan" utama>
            {pilih.tahu.semua}
          </BarisJalur>
          <BarisJalur to="/jelajah/alat" ikon="alat">
            {pilih.tahu.alat}
          </BarisJalur>
        </div>
      </section>

      <section className="mt-5">
        <CheckIn />
      </section>

    </Halaman>
  );
}

function BarisJalur({ to, ikon, utama, children }: { to: string; ikon: "panduan" | "alat"; utama?: boolean; children: ReactNode }) {
  return (
    <Link
      to={to}
      className={`flex min-h-[56px] items-center gap-3 rounded-kartu border-2 border-utama px-4 py-3 text-lg font-semibold ${
        utama ? "bg-utama-muda text-utama-gelap hover:bg-white" : "bg-white text-utama hover:bg-utama-muda"
      }`}
    >
      <IkonBeranda kunci={ikon} className="h-7 w-7" />
      <span className="flex-1">{children}</span>
      <ChevronRight className="h-6 w-6 shrink-0" strokeWidth={2.5} aria-hidden="true" focusable="false" />
    </Link>
  );
}
