import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Halaman } from "../components/Halaman";
import { NavBawah } from "../components/NavBawah";
import { Pilihan } from "../components/Pilihan";
import { konten } from "../domain/content";
import { isi } from "../lib/teks";
import { daftarPertanyaan, kandidatPrioritas, perluTahapPrioritas } from "../state/asesmen";
import { useStore } from "../state/store";

const { pertanyaan: t } = konten.ui.asesmen;

// Tahap c: pertanyaan ya/tidak, satu per layar. Pertanyaan "umum" selalu terakhir.
export function AsesmenPertanyaan() {
  const { nomor } = useParams();
  const navigate = useNavigate();
  const { state, setJawaban } = useStore();
  const { status, prioritas, jawaban } = state.asesmen;

  const daftar = daftarPertanyaan(konten.asesmen, prioritas);
  const n = Number(nomor);

  if (Object.keys(status).length === 0) return <Navigate to="/asesmen/aktivitas" replace />;
  if (!Number.isInteger(n) || n < 1 || n > daftar.length) return <Navigate to="/asesmen/pertanyaan/1" replace />;

  const q = daftar[n - 1];
  const nilai = jawaban[q.id];
  const terakhir = n === daftar.length;
  const indikator = isi(t.indikator, { n, total: daftar.length });
  const kelompok = konten.asesmen.aktivitas.find((a) => a.id === q.aktivitas)?.label;

  const kembali = () => {
    if (n > 1) return navigate(`/asesmen/pertanyaan/${n - 1}`);
    navigate(perluTahapPrioritas(kandidatPrioritas(konten.asesmen, status)) ? "/asesmen/prioritas" : "/asesmen/aktivitas");
  };

  return (
    <Halaman judul={q.pertanyaan} kunciFokus={n}>
      <p className="mt-2 text-sm text-redup" aria-live="polite">
        {kelompok} · {indikator}
      </p>
      <progress className="mt-1 h-2 w-full accent-utama" max={daftar.length} value={n} aria-label={indikator} />

      <fieldset className="mt-5">
        <legend className="sr-only">{q.pertanyaan}</legend>
        <div className="space-y-3">
          <Pilihan tipe="radio" nama={q.id} label={t.ya} aktif={nilai === true} onUbah={() => setJawaban(q.id, true)} />
          <Pilihan tipe="radio" nama={q.id} label={t.tidak} aktif={nilai === false} onUbah={() => setJawaban(q.id, false)} />
        </div>
      </fieldset>

      <div aria-live="polite" className="mt-4">
        {nilai === true && (
          <p className="rounded-kartu bg-utama-muda p-3">
            <span className="font-semibold">{t.penjelasanJudul}</span> {q.penjelasan}
          </p>
        )}
      </div>

      <NavBawah
        onKembali={kembali}
        onLanjut={() => navigate(terakhir ? "/asesmen/foto" : `/asesmen/pertanyaan/${n + 1}`)}
        lanjutNonaktif={nilai === undefined}
      />
    </Halaman>
  );
}
