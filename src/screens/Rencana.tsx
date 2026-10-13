import { Halaman } from "../components/Halaman";
import { TombolLink } from "../components/Tombol";
import { konten } from "../domain/content";

const { rencana, umum } = konten.ui;

// Penampung sementara; layar sebenarnya dibangun di milestone 5.
export function Rencana() {
  return (
    <Halaman judul={rencana.judul}>
      <p className="mt-4">{rencana.sementara}</p>
      <TombolLink to="/" gayaTombol="sekunder" className="mt-6">
        {umum.keBeranda}
      </TombolLink>
    </Halaman>
  );
}
