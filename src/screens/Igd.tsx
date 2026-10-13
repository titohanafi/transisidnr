import { Halaman } from "../components/Halaman";
import { TombolLink } from "../components/Tombol";
import { konten } from "../domain/content";

const { igd, umum } = konten.ui;

// Konten medis sengaja tidak ditulis di sini; teks diisi tim medis (lihat DECISIONS.md).
export function Igd() {
  return (
    <Halaman judul={igd.judul}>
      <p className="mt-4 text-lg">{igd.isi}</p>
      <TombolLink to="/" gayaTombol="sekunder" className="mt-6">
        {umum.keBeranda}
      </TombolLink>
    </Halaman>
  );
}
