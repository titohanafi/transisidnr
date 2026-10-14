import { Link } from "react-router-dom";
import type { Kartu } from "../domain/schema";

// Baris panduan yang ringkas dan seluruhnya bisa disentuh. Dipakai di daftar panjang supaya tidak penuh tombol.
export function KartuBaris({ kartu }: { kartu: Kartu }) {
  return (
    <Link
      to={`/kartu/${kartu.id}`}
      className="tekan flex min-h-sentuh items-center gap-3 rounded-kartu border border-garis bg-white p-3 hover:bg-utama-muda"
    >
      <span className="flex-1">
        <span className="block font-semibold leading-snug">{kartu.judul}</span>
        <span className="mt-0.5 line-clamp-2 block text-sm text-redup">{kartu.situasi}</span>
      </span>
      <span aria-hidden="true" className="text-xl text-utama">
        ›
      </span>
    </Link>
  );
}
