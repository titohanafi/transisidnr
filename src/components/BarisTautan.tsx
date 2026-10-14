import { ChevronRight, type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

// Baris tautan berikon dalam kartu putih, untuk tujuan sekunder (daftar alat, cetak, dan sejenisnya).
export function BarisTautan({ ke, teks, keterangan, Ikon }: { ke: string; teks: string; keterangan?: string; Ikon: LucideIcon }) {
  return (
    <Link
      to={ke}
      className="tekan flex min-h-sentuh items-center gap-3 rounded-kartu border border-garis/70 bg-white p-4 shadow-kartu hover:bg-utama-muda"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-tombol bg-utama-muda">
        <Ikon className="h-6 w-6 text-utama" strokeWidth={2} aria-hidden="true" focusable="false" />
      </span>
      <span className="flex-1">
        <span className="block font-semibold">{teks}</span>
        {keterangan && <span className="block text-kecil text-redup">{keterangan}</span>}
      </span>
      <ChevronRight className="h-5 w-5 shrink-0 text-utama" strokeWidth={2} aria-hidden="true" focusable="false" />
    </Link>
  );
}
