import { Halaman } from "../components/Halaman";
import { TombolLink } from "../components/Tombol";
import { konten } from "../domain/content";

const { asesmen, umum } = konten.ui;

// Penampung sementara; layar sebenarnya dibangun di milestone 4.
export function Asesmen() {
  return (
    <Halaman judul={asesmen.judul}>
      <p className="mt-4">{asesmen.sementara}</p>
      <TombolLink to="/" gayaTombol="sekunder" className="mt-6">
        {umum.keBeranda}
      </TombolLink>
    </Halaman>
  );
}
