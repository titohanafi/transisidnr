import { Navigate, useNavigate } from "react-router-dom";
import { BarisRuangan } from "../components/BarisRuangan";
import { Halaman } from "../components/Halaman";
import { Ikon } from "../components/Ikon";
import { NavBawah } from "../components/NavBawah";
import { PilihanPil } from "../components/Pilihan";
import { konten } from "../domain/content";
import { kandidatPrioritas, perluTahapPrioritas } from "../state/asesmen";
import { STATUS_AKTIVITAS } from "../state/storage";
import { useStore } from "../state/store";
import { useRuangan } from "../state/useRuangan";

const { asesmen: t } = konten.ui;
const { aktivitas: ta } = t;

// Tahap a: pilih aktivitas yang relevan dan kondisinya.
export function AsesmenAktivitas() {
  const navigate = useNavigate();
  const { state, setStatusAktivitas } = useStore();
  const { status } = state.asesmen;
  const { ruangan } = useRuangan();
  const aktivitas = konten.asesmen.aktivitas.filter((a) => a.bisaDipilihPrioritas);
  const adaPilihan = aktivitas.some((a) => status[a.id]);

  const lanjut = () =>
    navigate(perluTahapPrioritas(kandidatPrioritas(konten.asesmen, status)) ? "/asesmen/prioritas" : "/asesmen/pertanyaan/1");

  if (!ruangan) return <Navigate to="/ruangan" replace />;

  return (
    <Halaman judul={ta.judul}>
      <BarisRuangan />
      <p className="mt-2 text-redup">{ta.bantuan}</p>

      <div className="mt-4 space-y-3">
        {aktivitas.map((a) => (
          <div
            key={a.id}
            role="radiogroup"
            aria-labelledby={`akt-judul-${a.id}`}
            className="rounded-kartu border border-garis/70 bg-white shadow-kartu p-3"
          >
            <p id={`akt-judul-${a.id}`} className="flex items-center gap-3 text-lg font-semibold">
              <Ikon kunci={a.id} className="h-9 w-9" />
              {a.label}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {STATUS_AKTIVITAS.map((s) => (
                <PilihanPil
                  key={s}
                  nama={`akt-${a.id}`}
                  label={ta.status[s]}
                  aktif={status[a.id] === s}
                  onUbah={() => setStatusAktivitas(a.id, s)}
                />
              ))}
              <PilihanPil
                nama={`akt-${a.id}`}
                label={ta.tidakRelevan}
                aktif={!status[a.id]}
                onUbah={() => setStatusAktivitas(a.id, null)}
              />
            </div>
          </div>
        ))}
      </div>

      {!adaPilihan && (
        <p className="mt-4 text-redup" role="status">
          {ta.minimal}
        </p>
      )}
      <NavBawah onKembali={() => navigate("/ruangan")} onLanjut={lanjut} lanjutNonaktif={!adaPilihan} />
    </Halaman>
  );
}
