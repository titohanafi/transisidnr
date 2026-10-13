import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Halaman } from "../components/Halaman";
import { NavBawah } from "../components/NavBawah";
import { Pilihan } from "../components/Pilihan";
import { konten } from "../domain/content";
import { isi } from "../lib/teks";
import { bisaLanjut, ubahPilihan } from "../state/onboarding";
import { useStore } from "../state/store";

const { onboarding: teks } = konten.ui;
const soal = konten.onboarding.pertanyaan;

export function Onboarding() {
  const { langkah } = useParams();
  const navigate = useNavigate();
  const { state, setJawabanOnboarding } = useStore();

  const n = Number(langkah);
  if (!Number.isInteger(n) || n < 1 || n > soal.length) return <Navigate to="/mulai/1" replace />;

  const q = soal[n - 1];
  const dipilih = state.onboarding[q.id] ?? [];
  const terakhir = n === soal.length;
  const tipe = q.banyakPilihan ? "checkbox" : "radio";
  const indikator = isi(teks.indikator, { n, total: soal.length });

  const lanjut = () => navigate(terakhir ? "/asesmen/aktivitas" : `/mulai/${n + 1}`);
  const kembali = () => navigate(n === 1 ? "/" : `/mulai/${n - 1}`);

  return (
    <Halaman judul={q.pertanyaan} kunciFokus={n}>
      <p className="mt-2 text-sm text-redup" aria-live="polite">
        {indikator}
      </p>
      <progress className="mt-1 h-2 w-full accent-utama" max={soal.length} value={n} aria-label={indikator} />

      <fieldset className="mt-5">
        <legend className="sr-only">{q.pertanyaan}</legend>
        {q.bantuan && <p className="mb-3 text-redup">{q.bantuan}</p>}
        <div className="space-y-3">
          {q.pilihan.map((p) => {
            const aktif = dipilih.includes(p.id);
            return (
              <Pilihan
                key={p.id}
                tipe={tipe}
                nama={q.id}
                label={p.label}
                aktif={aktif}
                onUbah={() => setJawabanOnboarding(q.id, ubahPilihan(q.banyakPilihan, dipilih, p.id))}
              />
            );
          })}
        </div>
      </fieldset>

      <NavBawah
        onKembali={kembali}
        onLanjut={lanjut}
        lanjutNonaktif={!bisaLanjut(dipilih)}
        teksLanjut={terakhir ? teks.lanjutTerakhir : undefined}
      />
    </Halaman>
  );
}
