import { useNavigate } from "react-router-dom";
import { Halaman } from "../components/Halaman";
import { Ikon } from "../components/Ikon";
import { NavBawah } from "../components/NavBawah";
import { Pilihan } from "../components/Pilihan";
import { konten } from "../domain/content";
import { kandidatPrioritas, perluTahapPrioritas } from "../state/asesmen";
import { STATUS_AKTIVITAS } from "../state/storage";
import { useStore } from "../state/store";

const { asesmen: t } = konten.ui;
const { aktivitas: ta } = t;

// Tahap a: pilih aktivitas yang relevan dan kondisinya.
export function AsesmenAktivitas() {
  const navigate = useNavigate();
  const { state, setStatusAktivitas } = useStore();
  const { status } = state.asesmen;
  const aktivitas = konten.asesmen.aktivitas.filter((a) => a.bisaDipilihPrioritas);
  const adaPilihan = aktivitas.some((a) => status[a.id]);

  const lanjut = () =>
    navigate(perluTahapPrioritas(kandidatPrioritas(konten.asesmen, status)) ? "/asesmen/prioritas" : "/asesmen/pertanyaan/1");

  return (
    <Halaman judul={ta.judul}>
      <p className="mt-2 text-redup">{ta.bantuan}</p>

      <div className="mt-4 space-y-5">
        {aktivitas.map((a) => (
          <fieldset key={a.id}>
            <legend className="mb-2 flex items-center gap-3 text-lg font-semibold">
              <Ikon kunci={a.id} className="h-9 w-9" />
              {a.label}
            </legend>
            <div className="space-y-2">
              <Pilihan
                tipe="radio"
                nama={`akt-${a.id}`}
                label={ta.tidakRelevan}
                aktif={!status[a.id]}
                onUbah={() => setStatusAktivitas(a.id, null)}
              />
              {STATUS_AKTIVITAS.map((s) => (
                <Pilihan
                  key={s}
                  tipe="radio"
                  nama={`akt-${a.id}`}
                  label={ta.status[s]}
                  aktif={status[a.id] === s}
                  onUbah={() => setStatusAktivitas(a.id, s)}
                />
              ))}
            </div>
          </fieldset>
        ))}
      </div>

      {!adaPilihan && (
        <p className="mt-4 text-redup" role="status">
          {ta.minimal}
        </p>
      )}
      <NavBawah onKembali={() => navigate("/mulai/" + konten.onboarding.pertanyaan.length)} onLanjut={lanjut} lanjutNonaktif={!adaPilihan} />
    </Halaman>
  );
}
