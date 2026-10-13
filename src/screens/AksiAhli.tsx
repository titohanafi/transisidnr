import { Navigate, useParams } from "react-router-dom";
import { AksiHalaman } from "../components/AksiHalaman";
import { konten } from "../domain/content";

const { aksi, kartu: tk } = konten.ui;
const t = aksi.ahli;

// Tanya ahli: menjelaskan jenis ahli yang cocok. Direktori terverifikasi belum ada di MVP.
export function AksiAhli() {
  const { id } = useParams();
  const kartu = konten.kartu.find((k) => k.id === id);
  if (!kartu) return <Navigate to="/rencana" replace />;

  return (
    <AksiHalaman judul={t.judul} kartu={kartu}>
      {kartu.bantuan && kartu.bantuan.length > 0 ? (
        <>
          <p className="mt-3">{t.bantuan}</p>
          <ul className="mt-3 space-y-3">
            {kartu.bantuan.map((b) => (
              <li key={b.jenis} className="rounded-kartu border border-garis bg-white p-3">
                <h2 className="font-semibold">{tk.jenisBantuan[b.jenis].nama}</h2>
                <p className="text-sm text-redup">{tk.jenisBantuan[b.jenis].arti}</p>
                <p className="mt-1">{b.keterangan}</p>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="mt-3">{t.kosong}</p>
      )}
      <p className="mt-4 font-medium">{tk.direktoriMenyusul}</p>
      <p role="note" className="mt-4 rounded-kartu border border-aksen bg-aksen-muda p-3">
        {t.nyeri}
      </p>
    </AksiHalaman>
  );
}
