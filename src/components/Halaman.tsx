import { useEffect, useRef, type ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BilahTab, namaMenu } from "./BilahTab";
import { konten } from "../domain/content";

const { app, umum } = konten.ui;

// Kerangka semua layar: header, tautan lewati, dan fokus ke judul saat layar berganti.
export function Halaman({
  judul,
  children,
  kunciFokus,
  kepala,
  judulTersembunyi = false,
  atasJudul,
  kepalaPutih = false,
}: {
  judul: string;
  children: ReactNode;
  kunciFokus?: string | number;
  /** Isi pita kepala selebar layar di bawah judul (mis. pengantar dan pencarian). Tanpa ini, halaman memakai tata letak biasa. */
  kepala?: ReactNode;
  /** Judul tetap ada untuk pembaca layar tetapi tidak ditampilkan (bila sudah jelas dari menu). */
  judulTersembunyi?: boolean;
  /** Elemen di atas judul di dalam kepala (mis. ikon). */
  atasJudul?: ReactNode;
  /** Kepala berupa hero putih selebar layar (tanpa kotak), di atas latar halaman yang berwarna. */
  kepalaPutih?: boolean;
}) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const menu = namaMenu(pathname);
  const dalam = !["/", "/jelajah", "/rencana", "/igd", "/saya"].includes(pathname);
  const h1 = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    h1.current?.focus();
    document.title = judul === app.nama ? app.nama : `${judul} | ${app.nama}`;
  }, [judul, kunciFokus]);

  const h1Elemen = (
    <h1 ref={h1} tabIndex={-1} className={judul === app.nama || judulTersembunyi ? "sr-only" : "mb-1 text-judul text-tinta outline-none"}>
      {judul}
    </h1>
  );

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-permukaan md:border-x md:border-garis md:shadow-kartu print:bg-white print:shadow-none">
      <a
        href="#isi"
        onClick={(e) => {
          e.preventDefault();
          h1.current?.focus();
        }}
        className="sr-only focus:not-sr-only focus:bg-white focus:p-3 print:hidden"
      >
        {umum.lewatiKeIsi}
      </a>
      <header className="sticky top-0 z-10 flex items-center gap-1 border-b border-garis bg-white px-2 py-1 print:hidden">
        {dalam && (
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label={umum.halamanSebelumnya}
            className="inline-flex h-sentuh w-sentuh items-center justify-center rounded-tombol text-utama"
          >
            <ChevronLeft className="h-7 w-7" strokeWidth={2} aria-hidden="true" focusable="false" />
          </button>
        )}
        {menu ? (
          <span className="inline-flex min-h-sentuh items-center px-2 text-lg font-bold text-utama">{menu}</span>
        ) : (
          <Link
            to="/"
            className={`inline-flex min-h-sentuh items-center text-xl font-extrabold tracking-tight text-utama ${dalam ? "" : "px-2"}`}
          >
            {app.nama}
            <span aria-hidden="true" className="text-aksen">
              .
            </span>
          </Link>
        )}
      </header>
      <main id="isi" className={`flex flex-1 flex-col pb-8 ${kepala ? "" : "px-4 pt-6"}`}>
        {/* Di Beranda judulnya sama dengan nama aplikasi di header: tetap ada untuk pembaca layar, tidak ditampilkan dua kali. */}
        {kepala ? (
          <>
            <div className={kepalaPutih ? "bg-white px-4 pb-6 pt-6" : "px-4 pb-5 pt-6"}>
              {atasJudul}
              {h1Elemen}
              {kepala}
            </div>
            <div className="flex flex-1 flex-col px-4 pt-6">{children}</div>
          </>
        ) : (
          <>
            {h1Elemen}
            {children}
          </>
        )}
      </main>
      <BilahTab />
    </div>
  );
}
