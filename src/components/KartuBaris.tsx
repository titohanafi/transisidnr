import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { Kartu } from "../domain/schema";

// Baris panduan di dalam kartu kelompok: hanya judul dan panah, tanpa wadah sendiri. Ringkasan ada di halaman panduan itu.
export function KartuBaris({ kartu }: { kartu: Kartu }) {
  return (
    <Link to={`/kartu/${kartu.id}`} className="tekan flex min-h-[56px] items-center gap-3 px-4 py-3 hover:bg-utama-muda">
      <span className="flex-1 font-semibold leading-snug">{kartu.judul}</span>
      <ChevronRight className="h-5 w-5 shrink-0 text-utama" strokeWidth={2} aria-hidden="true" focusable="false" />
    </Link>
  );
}
