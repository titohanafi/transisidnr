import { Package } from "lucide-react";
import { konten } from "../domain/content";

const t = konten.ui.aksi.beli;

// Foto produk di bawah judul. Bingkai berukuran tetap supaya tata letak tidak bergeser saat memuat.
// Tanpa foto: kotak polos dengan ikon dan teks "menyusul" (tidak mengarang gambar).
export function GambarProduk({ gambar }: { gambar: { url: string; alt: string } | null }) {
  return (
    <div className="mt-3 flex h-40 items-center justify-center overflow-hidden rounded-tombol bg-permukaan">
      {gambar ? (
        <img
          src={gambar.url}
          alt={gambar.alt}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="h-full w-full object-contain"
        />
      ) : (
        <div className="flex flex-col items-center gap-1 text-redup">
          <Package className="h-8 w-8" strokeWidth={1.75} aria-hidden="true" focusable="false" />
          <span className="text-kecil">{t.fotoMenyusul}</span>
        </div>
      )}
    </div>
  );
}
