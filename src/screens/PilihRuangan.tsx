import { useNavigate } from "react-router-dom";
import { Halaman } from "../components/Halaman";
import { NavBawah } from "../components/NavBawah";
import { Pilihan } from "../components/Pilihan";
import { Tanda } from "../components/Lencana";
import { konten } from "../domain/content";
import { useRuangan } from "../state/useRuangan";
import { useStore } from "../state/store";

const t = konten.ui.pilihRuangan;

// Langkah memilih ruangan. Ruangan yang belum tersedia ditampilkan redup dengan tanda "Segera".
export function PilihRuangan() {
  const navigate = useNavigate();
  const { setRuangan } = useStore();
  const { ruangan } = useRuangan();

  return (
    <Halaman judul={t.judul} kepala={<></>}>
      <fieldset>
        <legend className="sr-only">{t.judul}</legend>
        <div className="space-y-3">
          {konten.config.ruangan.map((r) => (
            <Pilihan
              key={r.id}
              tipe="radio"
              nama="ruangan"
              label={r.nama}
              aktif={ruangan?.id === r.id}
              nonaktif={!r.tersedia}
              onUbah={() => setRuangan(r.id)}
              lencana={r.tersedia ? undefined : <Tanda>{t.segera}</Tanda>}
            />
          ))}
        </div>
      </fieldset>
      <NavBawah
        onKembali={() => navigate("/mulai/" + konten.onboarding.pertanyaan.length)}
        onLanjut={() => {
          if (ruangan) setRuangan(ruangan.id);
          navigate("/asesmen/aktivitas");
        }}
        lanjutNonaktif={!ruangan}
        teksLanjut={t.lanjut}
      />
    </Halaman>
  );
}
