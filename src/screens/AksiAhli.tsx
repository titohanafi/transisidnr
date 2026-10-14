import { Navigate, useParams } from "react-router-dom";
import { AksiHalaman } from "../components/AksiHalaman";
import { TombolAksi } from "../components/TombolAksi";
import { konten } from "../domain/content";
import { susunTingkat } from "../domain/engine";
import { aksiKartu } from "../domain/jelajah";
import { useRencana } from "../state/useRencana";

const { aksi, kartu: tk } = konten.ui;
const t = aksi.ahli;

// Kenali peran ahli: menjelaskan jenis ahli yang cocok (termasuk tukang, dengan tombol pesan WhatsApp). Direktori terverifikasi belum ada di MVP.
export function AksiAhli() {
  const { id } = useParams();
  const { konteks } = useRencana();
  const kartu = konten.kartu.find((k) => k.id === id);
  if (!kartu) return <Navigate to="/rencana" replace />;

  // Tombol pesan ke tukang memakai tingkat paling ringan yang mendukungnya (sama seperti daftar Panduan).
  const tampil = susunTingkat(kartu, konteks)
    .filter((x) => x.tampil)
    .map((x) => x.tingkat);
  const tingkatTukang = aksiKartu(kartu, tampil).find((a) => a.jenis === "tukang")?.tingkat;

  return (
    <AksiHalaman judul={t.judul} kartu={kartu}>
      {kartu.bantuan && kartu.bantuan.length > 0 ? (
        <>
          <p className="mt-3">{t.bantuan}</p>
          <ul className="mt-3 space-y-3">
            {kartu.bantuan.map((b) => (
              <li key={b.jenis} className="rounded-kartu border border-garis/70 bg-white shadow-kartu p-3">
                <h2 className="font-semibold">{tk.jenisBantuan[b.jenis].nama}</h2>
                <p className="text-sm text-redup">{tk.jenisBantuan[b.jenis].arti}</p>
                <p className="mt-1">{b.keterangan}</p>
                {b.jenis === "tukang" && tingkatTukang && (
                  <TombolAksi jenis="tukang" kartuId={kartu.id} tingkat={tingkatTukang} gayaTombol="sekunder" className="mt-3 w-full" />
                )}
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
