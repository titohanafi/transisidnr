import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { Kartu } from "../domain/schema";

// Baris panduan yang ringkas dan seluruhnya bisa disentuh. Hanya judul: ringkasan ada di halaman panduan itu sendiri.
export function KartuBaris({ kartu }: { kartu: Kartu }) {
  return (
    <Link
      to={`/kartu/${kartu.id}`}
      className="tekan flex min-h-sentuh items-center gap-3 rounded-kartu border border-garis/70 bg-white p-4 shadow-kartu hover:bg-utama-muda"
    >
      <span className="flex-1 font-semibold leading-snug">{kartu.judul}</span>
      <ChevronRight className="h-5 w-5 shrink-0 text-utama" strokeWidth={2} aria-hidden="true" focusable="false" />
    </Link>
  );
}
