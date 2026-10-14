import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Halaman } from "../components/Halaman";
import { Camera } from "lucide-react";
import { NavBawah } from "../components/NavBawah";
import { Tombol } from "../components/Tombol";
import { konten } from "../domain/content";
import { kecilkanFoto } from "../lib/foto";
import { daftarPertanyaan } from "../state/asesmen";
import { useStore } from "../state/store";

const { foto: t } = konten.ui.asesmen;

// Foto opsional: dikecilkan dan disimpan hanya di perangkat.
export function AsesmenFoto() {
  const navigate = useNavigate();
  const { state, foto, setFoto } = useStore();
  const input = useRef<HTMLInputElement>(null);
  const [galat, setGalat] = useState<string | null>(null);

  const jumlah = daftarPertanyaan(konten.asesmen, state.asesmen.prioritas).length;

  const pilih = async (berkas: File | undefined) => {
    if (!berkas) return;
    setGalat(null);
    let url: string;
    try {
      url = await kecilkanFoto(berkas);
    } catch {
      setGalat(t.gagalBaca);
      return;
    }
    if (!setFoto(url)) setGalat(t.gagalSimpan);
  };

  return (
    <Halaman judul={t.judul}>
      <p className="mt-2 text-redup">{t.penjelasan}</p>

      {!foto && (
        <button
          type="button"
          onClick={() => input.current?.click()}
          className="mt-4 flex min-h-[10rem] w-full flex-col items-center justify-center gap-2 rounded-kartu border border-dashed border-utama bg-utama-muda p-4 text-utama-gelap"
        >
          <Camera className="h-12 w-12 shrink-0 text-utama" strokeWidth={2} aria-hidden="true" focusable="false" />
          <span className="text-lg font-semibold">{t.pilih}</span>
        </button>
      )}

      {foto && <img src={foto} alt={t.alt} className="mt-4 max-h-64 w-full rounded-kartu border border-garis object-contain" />}

      <input
        ref={input}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          void pilih(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <div className="mt-4 flex flex-col gap-3">
        {foto && (
          <Tombol gayaTombol="sekunder" onClick={() => input.current?.click()}>
            {t.ganti}
          </Tombol>
        )}
        {foto && (
          <Tombol
            gayaTombol="sekunder"
            onClick={() => {
              setFoto(null);
              setGalat(null);
            }}
          >
            {t.hapus}
          </Tombol>
        )}
      </div>
      <p role="alert" className="mt-3 text-bahaya">
        {galat}
      </p>

      <NavBawah
        onKembali={() => navigate(`/asesmen/pertanyaan/${jumlah}`)}
        onLanjut={() => navigate("/rencana")}
        teksLanjut={foto ? t.selesai : t.lewati}
      />
    </Halaman>
  );
}
