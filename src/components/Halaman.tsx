import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BilahTab, namaMenu } from "./BilahTab";
import { HiasanPita } from "./KartuHero";
import { konten } from "../domain/content";

const { app, umum } = konten.ui;

// Warna pita kepala. "gelap" sama dengan kartu hero teal, lengkap dengan lingkaran hiasan rata bawah.
const warnaPita = {
  biasa: "bg-permukaan",
  hijau: "bg-utama-muda",
  gelap: "relative overflow-hidden bg-utama text-white",
} as const;

// Kerangka semua layar: header, tautan lewati, dan fokus ke judul saat layar berganti.
export function Halaman({
  judul,
  children,
  kunciFokus,
  kepala,
  judulTersembunyi = false,
  atasJudul,
  kepalaPita = false,
  kepalaTumpang = false,
  hiasan,
  latarPutih = false,
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
  /** Kepala berupa hero abu kehijauan muda selebar layar (tanpa kotak), sama dengan latar halaman Panduan. */
  kepalaPita?: boolean | "hijau" | "gelap";
  /** Isi halaman naik menimpa bagian bawah pita kepala (kartu pertama sedikit menumpuk di atas hero). */
  kepalaTumpang?: boolean;
  /** Hiasan di sisi kanan judul pada kepala pita (mis. ilustrasi). Dekoratif. */
  hiasan?: ReactNode;
  /** Latar halaman putih (bawaan: abu kehijauan muda). Dipakai Beranda, yang punya pita pencarian berwarna. */
  latarPutih?: boolean;
}) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  // Header: halaman panduan dan aksinya memakai "Panduan"; halaman alat (daftar alat dan beli) memakai "Produk Disabilitas".
  const menu = /^\/(aksi\/beli|jelajah\/alat)(\/|$)/.test(pathname)
    ? umum.headerPakaiAlat
    : (namaMenu(pathname) ?? (/^\/(kartu|aksi)\//.test(pathname) ? umum.tabPanduan : null));
  // Pita kepala gelap: bilah atas ikut berwarna teal (tanpa garis bawah), dan cincin fokus diputihkan supaya tetap terlihat.
  // Saat halaman digulir, bilah kembali putih (pita sudah tidak di belakangnya).
  const [digulir, setDigulir] = useState(() => typeof window !== "undefined" && window.scrollY > 8);
  const pitaGelap = kepalaPita === "gelap";
  useEffect(() => {
    if (!pitaGelap) return;
    const baca = () => setDigulir(window.scrollY > 8);
    baca();
    window.addEventListener("scroll", baca, { passive: true });
    return () => window.removeEventListener("scroll", baca);
  }, [pitaGelap]);
  const gelap = pitaGelap && !digulir;
  const fokusHeader = gelap ? "focus-visible:outline-white" : "";
  const dalam = !["/", "/jelajah", "/rencana", "/pindai", "/kontak", "/saya"].includes(pathname);
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
    <div
      className={`mx-auto flex min-h-screen max-w-md flex-col ${latarPutih ? "bg-kertas" : "bg-permukaan"} md:border-x md:border-garis md:shadow-kartu print:bg-white print:shadow-none`}
    >
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
      <header
        className={`sticky top-0 z-10 flex items-center gap-1 border-b px-2 py-1 transition-colors duration-150 motion-reduce:transition-none print:hidden ${
          gelap ? "border-utama bg-utama text-white" : "border-garis bg-white text-utama"
        }`}
      >
        {dalam && (
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label={umum.halamanSebelumnya}
            className={`inline-flex h-sentuh w-sentuh items-center justify-center rounded-tombol ${fokusHeader}`}
          >
            <ChevronLeft className="h-7 w-7" strokeWidth={2} aria-hidden="true" focusable="false" />
          </button>
        )}
        {menu ? (
          <span className="inline-flex min-h-sentuh items-center px-2 text-lg font-bold">{menu}</span>
        ) : (
          <Link
            to="/"
            className={`inline-flex min-h-sentuh items-center text-xl font-extrabold tracking-tight ${fokusHeader} ${dalam ? "" : "px-2"}`}
          >
            {app.nama}
            <span aria-hidden="true" className={gelap ? "text-daun" : "text-aksen"}>
              .
            </span>
          </Link>
        )}
      </header>
      <main id="isi" className={`flex flex-1 flex-col pb-8 ${kepala ? "" : "px-4 pt-6"}`}>
        {/* Di Beranda judulnya sama dengan nama aplikasi di header: tetap ada untuk pembaca layar, tidak ditampilkan dua kali. */}
        {kepala ? (
          <>
            <div
              className={
                kepalaPita
                  ? `${warnaPita[kepalaPita === true ? "biasa" : kepalaPita]} px-4 ${kepalaPita === "gelap" ? (kepalaTumpang ? "pb-20 pt-8" : "pb-10 pt-8") : kepalaTumpang ? "pb-12 pt-6" : "pb-6 pt-6"}`
                  : "px-4 pb-5 pt-6"
              }
            >
              {kepalaPita === "gelap" && <HiasanPita />}
              <div className="relative">
                {hiasan ? (
                  <div className="flex items-center gap-2">
                    <div className="min-w-0 flex-1">
                      {atasJudul}
                      {h1Elemen}
                    </div>
                    {hiasan}
                  </div>
                ) : (
                  <>
                    {atasJudul}
                    {h1Elemen}
                  </>
                )}
                {kepala}
              </div>
            </div>
            <div className={`flex flex-1 flex-col px-4 ${kepalaTumpang ? "relative -mt-8" : "pt-6"}`}>{children}</div>
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
