import { Halaman } from "../components/Halaman";
import { TombolLink } from "../components/Tombol";
import { konten } from "../domain/content";

const { igd, umum } = konten.ui;

// Daftar tanda bahaya adalah konten medis: diisi tim medis di content/ui.json (igd.tandaBahaya), bukan di sini.
export function Igd() {
  const siap = igd.tandaBahaya.length > 0;
  return (
    <Halaman judul={igd.judul}>
      <p className="mt-4 text-lg">{igd.isi}</p>
      {siap ? (
        <section className="mt-bagian" aria-labelledby="judul-tanda-bahaya">
          <h2 id="judul-tanda-bahaya" className="text-subjudul">
            {igd.daftarJudul}
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            {igd.tandaBahaya.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>
      ) : (
        <p role="note" className="mt-4 rounded-kartu border border-garis/70 bg-white shadow-kartu p-3">
          {igd.menyusul}
        </p>
      )}
      <TombolLink to="/" gayaTombol="sekunder" className="mt-6">
        {umum.keBeranda}
      </TombolLink>
    </Halaman>
  );
}
