import { Link } from "react-router-dom";
import { konten } from "../domain/content";

export function PeringatanNonMedis() {
  const { umum } = konten.ui;
  return (
    <div role="note" className="mt-5 rounded-kartu border border-garis bg-white p-3 text-sm text-redup">
      <p>{umum.peringatanNonMedis}</p>
      <Link to="/igd" className="mt-1 inline-flex min-h-sentuh items-center text-utama underline print:hidden">
        {umum.tautanIgd}
      </Link>
    </div>
  );
}
