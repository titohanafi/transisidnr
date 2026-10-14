import { TriangleAlert } from "lucide-react";
import { Halaman } from "../components/Halaman";
import { TombolLink } from "../components/Tombol";
import { konten } from "../domain/content";

const { igd, umum } = konten.ui;

// Daftar tanda bahaya adalah konten medis: diisi tim medis di content/ui.json (igd.tandaBahaya), bukan di sini.
export function Igd() {
  const siap = igd.tandaBahaya.length > 0;
  return (
    <Halaman judul={igd.judul} kepala={<p className="mt-2 text-lg">{igd.isi}</p>}>
      <div className="flex flex-col gap-bagian">
        {siap ? (
          <section className="rounded-kartu border border-bahaya/25 bg-bahaya-muda p-5" aria-labelledby="judul-tanda-bahaya">
            <div className="flex items-center gap-3 text-bahaya">
              <TriangleAlert className="h-6 w-6 shrink-0" strokeWidth={2} aria-hidden="true" focusable="false" />
              <h2 id="judul-tanda-bahaya" className="text-subjudul">
                {igd.daftarJudul}
              </h2>
            </div>
            <ul className="mt-4 space-y-3">
              {igd.tandaBahaya.map((t) => (
                <li key={t} className="flex gap-3">
                  <span aria-hidden="true" className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-bahaya" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <p role="note" className="rounded-kartu border border-garis/70 bg-white p-5 shadow-kartu">
            {igd.menyusul}
          </p>
        )}
        <TombolLink to="/" gayaTombol="sekunder">
          {umum.keBeranda}
        </TombolLink>
      </div>
    </Halaman>
  );
}
