import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Halaman } from "../components/Halaman";
import { IlustrasiBeranda } from "../components/Ikon";
import { TombolLink } from "../components/Tombol";
import { konten } from "../domain/content";

const { app, beranda, umum } = konten.ui;

export function Beranda() {
  return (
    <Halaman judul={app.nama}>
      <IlustrasiBeranda className="mt-3" />
      <p className="mt-3 text-lg">{beranda.manfaat}</p>

      <p role="note" className="mt-4 rounded-kartu border border-draf bg-draf-muda p-3 text-draf">
        {beranda.spandukDraf}
      </p>

      <ol className="mt-5 space-y-3">
        {beranda.langkah.map((l, i) => (
          <li key={l.judul} className="flex gap-3 rounded-kartu border border-garis bg-white p-3">
            <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-utama font-bold text-white">
              {i + 1}
            </span>
            <div>
              <h2 className="font-semibold">{l.judul}</h2>
              <p className="text-redup">{l.isi}</p>
            </div>
          </li>
        ))}
      </ol>

      <TombolLink to="/mulai/1" className="mt-6 w-full">
        {beranda.tombolMulai}
      </TombolLink>
      <p className="mt-3 text-sm text-redup">{umum.privasi}</p>

      <section className="mt-6 rounded-kartu border border-garis bg-white p-4" aria-labelledby="jelajah">
        <h2 id="jelajah" className="text-lg font-semibold">
          {beranda.jelajah.judul}
        </h2>
        <p className="mt-1 text-redup">{beranda.jelajah.isi}</p>
        <TombolLink to="/jelajah" gayaTombol="sekunder" className="mt-3 w-full">
          {beranda.jelajah.tombol}
        </TombolLink>
      </section>

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
