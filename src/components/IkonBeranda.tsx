import { HouseHeart, ListChecks, type LucideIcon } from "lucide-react";

// Ikon kartu utama Beranda dari Lucide (ISC). Dekoratif: artinya sudah ada di teks.
// "susun" = cek kebutuhan di rumah (rumah dengan hati: rumah yang dirawat); "lanjut" = lanjutkan daftar langkah.
const ikon: Record<"susun" | "lanjut", LucideIcon> = { susun: HouseHeart, lanjut: ListChecks };

export function IkonBeranda({ kunci, className = "h-7 w-7" }: { kunci: "susun" | "lanjut"; className?: string }) {
  const Komponen = ikon[kunci];
  return <Komponen className={`shrink-0 ${className}`} strokeWidth={2} aria-hidden="true" focusable="false" />;
}
