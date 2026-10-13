import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Halaman } from "../components/Halaman";
import { IlustrasiBeranda } from "../components/Ikon";
import { TombolLink } from "../components/Tombol";
import { konten } from "../domain/content";

const { app, beranda, umum } = konten.ui;
const { pilih } = beranda;

export function Beranda() {
  return (
    <Halaman judul={app.nama}>
      <p className="mt-2 text-lg">{beranda.manfaat}</p>

      <p role="note" className="mt-3 rounded-kartu border border-draf bg-draf-muda p-2 text-sm text-draf">
        {beranda.spandukDraf}
      </p>

      <h2 className="sr-only">{pilih.judul}</h2>

      {/* Dua jalur dengan bobot setara: dipandu, atau langsung ke yang dicari. */}
      <section className="mt-4 rounded-kartu border border-garis bg-white p-4" aria-labelledby="jalur-susun">
        <h3 id="jalur-susun" className="text-lg font-semibold">
          {pilih.susun.judul}
        </h3>
        <p className="mt-1 text-redup">{pilih.susun.isi}</p>
        <TombolLink to="/mulai/1" className="mt-3 w-full">
          {pilih.susun.tombol}
        </TombolLink>
      </section>

      <section className="mt-3 rounded-kartu border border-garis bg-white p-4" aria-labelledby="jalur-tahu">
        <h3 id="jalur-tahu" className="text-lg font-semibold">
          {pilih.tahu.judul}
        </h3>
        <p className="mt-1 text-redup">{pilih.tahu.isi}</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <TombolLink to="/jelajah/alat" gayaTombol="sekunder" className="!px-1">
            {pilih.tahu.alat}
          </TombolLink>
          <TombolLink to="/jelajah/tukang" gayaTombol="sekunder" className="!px-1">
            {pilih.tahu.tukang}
          </TombolLink>
          <TombolLink to="/jelajah/ahli" gayaTombol="sekunder" className="!px-1">
            {pilih.tahu.ahli}
          </TombolLink>
        </div>
        <Link to="/jelajah" className="mt-2 inline-flex min-h-sentuh items-center text-utama underline">
          {pilih.tahu.semua}
        </Link>
      </section>

      <p className="mt-3 text-sm text-redup">{umum.privasi}</p>

      <IlustrasiBeranda className="mt-5" />

      <details className="mt-5 rounded-kartu border border-garis bg-white p-3">
        <summary className="flex min-h-sentuh cursor-pointer items-center font-semibold">{beranda.caraKerja}</summary>
        <ol className="mt-2 space-y-3">
          {beranda.langkah.map((l, i) => (
            <li key={l.judul} className="flex gap-3">
              <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-utama font-bold text-white">
                {i + 1}
              </span>
              <div>
                <p className="font-semibold">{l.judul}</p>
                <p className="text-redup">{l.isi}</p>
              </div>
            </li>
          ))}
        </ol>
      </details>

      <nav aria-label={umum.tautanLain} className="mt-auto flex flex-col pt-8">
        <TautanKecil to="/igd">{beranda.tautanIgd}</TautanKecil>
        <TautanKecil to="/hapus">{beranda.tautanHapus}</TautanKecil>
      </nav>
    </Halaman>
  );
}

function TautanKecil({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="inline-flex min-h-sentuh items-center text-utama underline">
      {children}
    </Link>
  );
}
