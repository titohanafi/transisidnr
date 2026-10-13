import { konten } from "../domain/content";
import { useStore } from "../state/store";
import { Pilihan } from "./Pilihan";

const t = konten.ui.checkin;

// Satu pertanyaan untuk caregiver. Jawaban disimpan lokal; tanpa skor dan tanpa diagnosis.
export function CheckIn() {
  const { state, setCheckin } = useStore();
  const pilihan = t.pilihan.find((p) => p.id === state.checkin);

  return (
    <fieldset className="rounded-kartu bg-aksen-muda p-4">
      <legend className="px-1">
        <span className="block text-sm font-semibold uppercase tracking-wide text-aksen">{t.label}</span>
        <span className="block text-xl font-bold">{t.pertanyaan}</span>
      </legend>
      <p className="mt-1 text-redup">{t.sapaan}</p>
      <div className="mt-2 space-y-2">
        {t.pilihan.map((p) => (
          <Pilihan key={p.id} tipe="radio" nama="checkin" label={p.label} aktif={state.checkin === p.id} onUbah={() => setCheckin(p.id)} />
        ))}
      </div>
      <div aria-live="polite" className="mt-3">
        {pilihan && (
          <p className="rounded-kartu bg-white p-3">
            {pilihan.balasan} {t.penutup}
          </p>
        )}
      </div>
    </fieldset>
  );
}
