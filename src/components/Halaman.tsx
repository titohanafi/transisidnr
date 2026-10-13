import { useEffect, useRef, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { konten } from "../domain/content";

const { app, umum } = konten.ui;

// Kerangka semua layar: header, tautan lewati, dan fokus ke judul saat layar berganti.
export function Halaman({ judul, children, kunciFokus }: { judul: string; children: ReactNode; kunciFokus?: string | number }) {
  const h1 = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    h1.current?.focus();
    document.title = judul === app.nama ? app.nama : `${judul} | ${app.nama}`;
  }, [judul, kunciFokus]);

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col">
      <a
        href="#isi"
        onClick={(e) => {
          e.preventDefault();
          h1.current?.focus();
        }}
        className="sr-only focus:not-sr-only focus:bg-white focus:p-3"
      >
        {umum.lewatiKeIsi}
      </a>
      <header className="border-b border-garis px-4 py-3">
        <Link to="/" className="inline-flex min-h-sentuh items-center text-lg font-bold text-utama">
          {app.nama}
        </Link>
      </header>
      <main id="isi" className="flex flex-1 flex-col px-4 py-5">
        <h1 ref={h1} tabIndex={-1} className="text-2xl font-bold leading-snug outline-none">
          {judul}
        </h1>
        {children}
      </main>
    </div>
  );
}
