import type { ReactNode } from "react";

// Bagian yang bisa dilipat (details/summary asli, aksesibel tanpa skrip). Mengurangi tumpukan teks.
export function Lipat({ judul, children, buka = false }: { judul: string; children: ReactNode; buka?: boolean }) {
  return (
    <details open={buka} className="group mt-isi rounded-kartu border border-garis/70 bg-white shadow-kartu">
      <summary className="flex min-h-sentuh cursor-pointer list-none items-center justify-between gap-2 px-4 py-2 text-judulKartu [&::-webkit-details-marker]:hidden">
        <span>{judul}</span>
        <span aria-hidden="true" className="text-utama group-open:hidden">+</span>
        <span aria-hidden="true" className="hidden text-utama group-open:inline">−</span>
      </summary>
      <div className="border-t border-garis/70 p-4">{children}</div>
    </details>
  );
}
