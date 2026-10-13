import { konten } from "../domain/content";

export function PeringatanNonMedis() {
  return (
    <p role="note" className="mt-5 rounded-kartu border border-garis bg-white p-3 text-sm text-redup">
      {konten.ui.umum.peringatanNonMedis}
    </p>
  );
}
