import { Info } from "lucide-react";
import { Link } from "react-router-dom";
import { konten } from "../domain/content";

export function PeringatanNonMedis({ className = "mt-4" }: { className?: string }) {
  const { umum } = konten.ui;
  return (
    <div role="note" className={`flex items-start gap-3 rounded-kartu bg-utama-muda p-4 text-kecil text-tinta ${className}`}>
      <Info className="mt-0.5 h-5 w-5 shrink-0 text-utama" strokeWidth={2} aria-hidden="true" focusable="false" />
      <div>
        <p>{umum.peringatanNonMedis}</p>
        <Link to="/igd" className="mt-1 inline-flex min-h-sentuh items-center font-semibold text-utama underline print:hidden">
          {umum.tautanIgd}
        </Link>
      </div>
    </div>
  );
}
