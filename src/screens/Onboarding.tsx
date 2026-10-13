import { Navigate, useNavigate, useParams } from "react-router-dom";
import { BilahKemajuan } from "../components/BilahKemajuan";
import { Halaman } from "../components/Halaman";
import { NavBawah } from "../components/NavBawah";
import { Pilihan } from "../components/Pilihan";
import { konten } from "../domain/content";
import { pilihanPertanyaan } from "../domain/onboarding";
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

  const respons = pilihanPertanyaan(q, konten.config).find((p) => dipilih.includes(p.id) && p.respons)?.respons;
  const lanjut = () => navigate(terakhir ? "/ruangan" : `/mulai/${n + 1}`);
  const kembali = () => navigate(n === 1 ? "/" : `/mulai/${n - 1}`);

  return (
    <Halaman judul={q.pertanyaan} kunciFokus={n}>
      <p className="mt-2 text-sm text-redup" aria-live="polite">
        {indikator}
      </p>
      <BilahKemajuan n={n} total={soal.length} label={indikator} />

      <fieldset className="mt-5">
        <legend className="sr-only">{q.pertanyaan}</legend>
        {q.bantuan && <p className="mb-3 text-redup">{q.bantuan}</p>}
        <div className="space-y-3">
          {pilihanPertanyaan(q, konten.config).map((p) => {
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
        <div aria-live="polite" className="mt-4 min-h-[3.5rem]">
          {respons && (
            <p key={respons} className="rounded-kartu bg-aksen-muda p-3 motion-safe:animate-muncul">
              {respons}
            </p>
          )}
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
