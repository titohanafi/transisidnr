import { Link } from "react-router-dom";
import { konten } from "../domain/content";

export function PeringatanNonMedis() {
  const { umum } = konten.ui;
  return (
    <div role="note" className="mt-4 rounded-r-kartu border-l-4 border-utama bg-utama-muda p-3 text-sm text-tinta">
      <p>{umum.peringatanNonMedis}</p>
      <Link to="/igd" className="mt-1 inline-flex min-h-sentuh items-center text-utama underline print:hidden">
        {umum.tautanIgd}
      </Link>
    </div>
  );
}
