import type { ReactNode } from "react";

// Bagian yang bisa dilipat (details/summary asli, aksesibel tanpa skrip). Mengurangi tumpukan teks.
export function Lipat({ judul, children, buka = false }: { judul: string; children: ReactNode; buka?: boolean }) {
  return (
    <details open={buka} className="group mt-3 rounded-kartu border border-garis bg-white">
      <summary className="flex min-h-sentuh cursor-pointer list-none items-center justify-between gap-2 px-3 py-2 text-lg font-semibold [&::-webkit-details-marker]:hidden">
        <span>{judul}</span>
        <span aria-hidden="true" className="text-utama group-open:hidden">+</span>
        <span aria-hidden="true" className="hidden text-utama group-open:inline">−</span>
      </summary>
      <div className="border-t border-garis p-3">{children}</div>
    </details>
  );
}
