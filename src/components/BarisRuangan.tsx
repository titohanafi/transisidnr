import { Link } from "react-router-dom";
import { konten } from "../domain/content";
import { isi } from "../lib/teks";
import { useRuangan } from "../state/useRuangan";

const t = konten.ui.asesmen;

// Menunjukkan ruangan yang sedang dikerjakan, dengan jalan pintas untuk menggantinya.
export function BarisRuangan() {
  const { ruangan } = useRuangan();
  if (!ruangan) return null;
  return (
    <p className="mt-2 flex flex-wrap items-center gap-x-3 text-redup">
      <span>{isi(t.ruangan, { nama: ruangan.nama })}</span>
      {konten.config.ruangan.length > 1 && (
        <Link to="/ruangan" className="inline-flex min-h-sentuh items-center text-utama underline">
          {t.ubahRuangan}
        </Link>
      )}
    </p>
  );
}
