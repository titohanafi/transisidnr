import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

// Bagian yang bisa dilipat (details/summary asli, aksesibel tanpa skrip). Mengurangi tumpukan teks.
export function Lipat({
  judul,
  children,
  buka = false,
  className = "mt-isi",
}: {
  judul: string;
  children: ReactNode;
  buka?: boolean;
  className?: string;
}) {
  return (
    <details open={buka} className={`group ${className} rounded-kartu border border-garis/70 bg-white shadow-kartu`}>
      <summary className="flex min-h-sentuh cursor-pointer list-none items-center justify-between gap-2 px-4 py-2 text-judulKartu [&::-webkit-details-marker]:hidden">
        <span>{judul}</span>
        <span aria-hidden="true" className="text-utama group-open:hidden">
          +
        </span>
        <span aria-hidden="true" className="hidden text-utama group-open:inline">
          −
        </span>
      </summary>
      <div className="border-t border-garis/70 p-4">{children}</div>
    </details>
  );
}

/** Baris lipat tanpa wadah sendiri, untuk ditumpuk dalam satu wadah berpemisah. */
export function LipatBaris({ judul, children }: { judul: string; children: ReactNode }) {
  return (
    <details className="group">
      <summary className="flex min-h-[56px] cursor-pointer list-none items-center justify-between gap-2 px-4 py-2 font-semibold [&::-webkit-details-marker]:hidden">
        <span>{judul}</span>
        <ChevronDown
          className="h-5 w-5 shrink-0 text-utama-gelap motion-safe:transition-transform group-open:rotate-180"
          strokeWidth={2}
          aria-hidden="true"
          focusable="false"
        />
      </summary>
      <div className="px-4 pb-4">{children}</div>
    </details>
  );
}
