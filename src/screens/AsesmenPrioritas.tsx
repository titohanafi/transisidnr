import { Navigate, useNavigate } from "react-router-dom";
import { Halaman } from "../components/Halaman";
import { Ikon } from "../components/Ikon";
import { NavBawah } from "../components/NavBawah";
import { Pilihan } from "../components/Pilihan";
import { konten } from "../domain/content";
import { MAKS_PRIORITAS, kandidatPrioritas, perluTahapPrioritas } from "../state/asesmen";
import { useStore } from "../state/store";

const { asesmen: t } = konten.ui;

// Tahap b: pilih satu atau dua prioritas dari aktivitas yang sulit atau diinginkan.
export function AsesmenPrioritas() {
  const navigate = useNavigate();
  const { state, togglePrioritas } = useStore();
  const { status, prioritas } = state.asesmen;
  const kandidat = kandidatPrioritas(konten.asesmen, status);

  if (!perluTahapPrioritas(kandidat)) return <Navigate to="/asesmen/pertanyaan/1" replace />;

  const penuh = prioritas.length >= MAKS_PRIORITAS;
  const label = (id: string) => konten.asesmen.aktivitas.find((a) => a.id === id)?.label ?? id;

  return (
    <Halaman judul={t.prioritas.judul}>
      <fieldset className="mt-2">
        <legend className="sr-only">{t.prioritas.judul}</legend>
        <p className="mb-3 text-redup">{t.prioritas.bantuan}</p>
        <div className="space-y-3">
          {kandidat.map((id) => (
            <Pilihan
              key={id}
              tipe="checkbox"
              nama="prioritas"
              label={label(id)}
              aktif={prioritas.includes(id)}
              nonaktif={penuh && !prioritas.includes(id)}
              ikon={<Ikon kunci={id} className="h-8 w-8" />}
              lencana={
                prioritas.includes(id) ? (
                  <span
                    aria-hidden="true"
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-utama text-sm font-bold text-white"
                  >
                    {prioritas.indexOf(id) + 1}
                  </span>
                ) : undefined
              }
              onUbah={() => togglePrioritas(id)}
            />
          ))}
        </div>
        <p className="mt-3 text-sm text-redup" role="status">
          {penuh ? t.prioritas.maksimal : ""}
        </p>
      </fieldset>
      <NavBawah
        onKembali={() => navigate("/asesmen/aktivitas")}
        onLanjut={() => navigate("/asesmen/pertanyaan/1")}
        lanjutNonaktif={prioritas.length === 0}
      />
    </Halaman>
  );
}
