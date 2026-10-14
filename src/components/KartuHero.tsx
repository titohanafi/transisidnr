import type { ReactNode } from "react";
import { Link } from "react-router-dom";

// Kartu sorotan teal dengan ikon di kiri judul dan hiasan lingkaran. Dipakai di Beranda dan Panduan Saya.
// Lingkaran hiasan lebih gelap dari latar kartu, jadi tidak pernah menurunkan kontras teks di atasnya.
export function KartuHero({
  id,
  ikon,
  judul,
  children,
  className = "",
}: {
  id: string;
  ikon: ReactNode;
  judul: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`relative overflow-hidden rounded-kartu bg-utama p-5 text-white ${className}`} aria-labelledby={id}>
      <HiasanLingkaran />

      <div className="relative flex items-center gap-4">
        {ikon}
        <h2 id={id} className="text-judulUtama">
          {judul}
        </h2>
      </div>
      {children}
    </section>
  );
}

/** Tombol putih di atas kartu hero. */
export function TautanHero({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="tekan relative mt-6 inline-flex min-h-sentuh w-full items-center justify-center rounded-tombol bg-white px-5 py-2 text-isi font-semibold text-utama-gelap hover:bg-utama-muda"
    >
      {children}
    </Link>
  );
}

/** Tiga lingkaran hiasan lebih gelap dari latar teal, jadi tidak pernah menurunkan kontras teks di atasnya. Induk harus relative dan overflow-hidden. */
export function HiasanLingkaran() {
  return (
    <>
      <span aria-hidden="true" className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-utama-gelap/40" />
      <span aria-hidden="true" className="pointer-events-none absolute -right-2 -top-20 h-32 w-32 rounded-full bg-utama-gelap/30" />
      <span aria-hidden="true" className="pointer-events-none absolute -bottom-16 -left-10 h-36 w-36 rounded-full bg-utama-gelap/30" />
    </>
  );
}

/**
 * Lingkaran hiasan untuk pita kepala gelap. Lebih kecil dan diletakkan di bagian atas pita, jadi tidak terpotong
 * garis lurus tepi atas atau tertutup kartu yang menimpa tepi bawah; hanya tepi layar yang memotongnya. Induk harus relative dan overflow-hidden.
 */
export function HiasanPita() {
  return (
    <>
      <span aria-hidden="true" className="pointer-events-none absolute -right-4 top-3 h-16 w-16 rounded-full bg-utama-gelap/40" />
      <span aria-hidden="true" className="pointer-events-none absolute right-14 top-9 h-10 w-10 rounded-full bg-utama-gelap/30" />
      <span aria-hidden="true" className="pointer-events-none absolute -left-3 top-6 h-14 w-14 rounded-full bg-utama-gelap/30" />
    </>
  );
}
