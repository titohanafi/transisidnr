import { UsersRound } from "lucide-react";
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
    <AksiHalaman judul={t.judul} kartu={kartu} pengantar={kartu.bantuan && kartu.bantuan.length > 0 ? t.bantuan : undefined}>
      {kartu.bantuan && kartu.bantuan.length > 0 ? (
        <ul className="space-y-3">
          {kartu.bantuan.map((b) => (
            <li key={b.jenis} className="rounded-kartu border border-garis/70 bg-white p-5 shadow-kartu">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-tombol bg-utama-muda">
                  <UsersRound className="h-6 w-6 text-utama" strokeWidth={2} aria-hidden="true" focusable="false" />
                </span>
                <div>
                  <h2 className="text-judulKartu">{tk.jenisBantuan[b.jenis].nama}</h2>
                  <p className="text-kecil text-redup">{tk.jenisBantuan[b.jenis].arti}</p>
                </div>
              </div>
              <p className="mt-3">{b.keterangan}</p>
              {b.jenis === "tukang" && tingkatTukang && (
                <TombolAksi jenis="tukang" kartuId={kartu.id} tingkat={tingkatTukang} gayaTombol="sekunder" className="mt-4 w-full" />
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>{t.kosong}</p>
      )}
      <p className="font-medium">{tk.direktoriMenyusul}</p>
      <p role="note" className="rounded-kartu border border-aksen/30 bg-aksen-muda p-5">
        {t.nyeri}
      </p>
    </AksiHalaman>
  );
}
