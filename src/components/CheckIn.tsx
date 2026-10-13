import { konten } from "../domain/content";
import { hariTerakhir, kunciHari, labelHari } from "../lib/tanggal";
import { useStore } from "../state/store";
import { PilihanPil } from "./Pilihan";

const t = konten.ui.checkin;

// Cek kondisi harian yang ringan untuk caregiver: satu baris pertanyaan, pilihan kecil, riwayat dilipat.
// Jawaban disimpan lokal per hari; tanpa skor dan tanpa diagnosis.
export function CheckIn() {
  const { state, setCheckin } = useStore();
  const hariIni = kunciHari();
  const jawabanHariIni = state.riwayatCheckin[hariIni] ?? null;
  const pilihan = t.pilihan.find((p) => p.id === jawabanHariIni);
  const labelDari = (id: string | undefined) => t.pilihan.find((p) => p.id === id)?.label;
  const hari = hariTerakhir(7);
  const adaRiwayat = Object.keys(state.riwayatCheckin).length > 0;

  return (
    <fieldset className="rounded-kartu border border-garis bg-white p-3">
      <legend className="px-1 text-sm text-redup">{t.label}</legend>
      <p className="font-semibold">{t.pertanyaan}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {t.pilihan.map((p) => (
          <PilihanPil key={p.id} nama="checkin" label={p.label} aktif={jawabanHariIni === p.id} onUbah={() => setCheckin(p.id)} />
        ))}
      </div>
      <div aria-live="polite">
        {pilihan && (
          <p className="mt-3 text-sm text-redup">
            {pilihan.balasan} {t.penutup}
          </p>
        )}
      </div>
      {adaRiwayat && (
        <details className="group mt-3 border-t border-garis pt-1">
          <summary className="flex min-h-sentuh cursor-pointer list-none items-center justify-between text-sm font-semibold text-utama-gelap [&::-webkit-details-marker]:hidden">
            <span>{t.riwayatJudul}</span>
            <span aria-hidden="true" className="group-open:hidden">+</span>
            <span aria-hidden="true" className="hidden group-open:inline">−</span>
          </summary>
          <ul className="divide-y divide-garis text-sm">
            {hari.map((h) => {
              const label = labelDari(state.riwayatCheckin[h]);
              return (
                <li key={h} className="flex justify-between gap-3 py-2">
                  <span className="text-redup">{h === hariIni ? t.hariIni : labelHari(h)}</span>
                  <span className={label ? "text-right font-medium" : "text-right text-redup"}>{label ?? t.belumDiisi}</span>
                </li>
              );
            })}
          </ul>
        </details>
      )}
    </fieldset>
  );
}
