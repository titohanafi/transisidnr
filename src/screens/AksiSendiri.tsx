import { AksiHalaman, KembaliKeRencana, useKonteksAksi } from "../components/AksiHalaman";
import { konten } from "../domain/content";
import { kunciChecklist } from "../domain/aksi";
import { isi } from "../lib/teks";
import { useStore } from "../state/store";

const t = konten.ui.aksi.sendiri;

// Lakukan sendiri: langkah dengan checklist yang tersimpan di perangkat.
export function AksiSendiri() {
  const ctx = useKonteksAksi();
  const { state, toggleLangkah } = useStore();
  if (!ctx) return <KembaliKeRencana />;

  const langkah = ctx.kartu.solusi![ctx.tingkat]!.langkah;
  const kunci = kunciChecklist(ctx.kartu.id, ctx.tingkat);
  const selesai = (state.checklist[kunci] ?? []).filter((n) => n < langkah.length);

  const dorongan =
    selesai.length === 0
      ? null
      : selesai.length === langkah.length
        ? t.selesai
        : selesai.length * 2 >= langkah.length
          ? t.dorongan.separuh
          : t.dorongan.mulai;

  return (
    <AksiHalaman judul={t.judul} kartu={ctx.kartu} tingkat={ctx.tingkat}>
      <p className="mt-3">{t.bantuan}</p>
      <p className="mt-3 font-semibold" aria-live="polite">
        {isi(t.progres, { n: selesai.length, total: langkah.length })}
      </p>
      <ul className="mt-3 space-y-3">
        {langkah.map((l, i) => {
          const centang = selesai.includes(i);
          return (
            <li key={i}>
              <label
                className={`flex min-h-sentuh cursor-pointer items-start gap-3 rounded-kartu border-2 p-3 ${
                  centang ? "border-utama bg-utama-muda" : "border-garis bg-white"
                }`}
              >
                <input
                  type="checkbox"
                  checked={centang}
                  onChange={() => toggleLangkah(kunci, i)}
                  className="mt-0.5 h-6 w-6 shrink-0 accent-utama"
                />
                <span className={centang ? "line-through" : ""}>{l}</span>
              </label>
            </li>
          );
        })}
      </ul>
      <div aria-live="polite">
        {dorongan && (
          <p key={dorongan} className="mt-4 rounded-kartu bg-utama-muda p-3 font-medium motion-safe:animate-muncul">
            {dorongan}
          </p>
        )}
      </div>
    </AksiHalaman>
  );
}
