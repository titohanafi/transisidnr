import { TombolLink } from "../components/Tombol";
import { Tombol } from "../components/Tombol";
import { AksiHalaman, KembaliKeRencana, useKonteksAksi } from "../components/AksiHalaman";
import { konten } from "../domain/content";
import { kunciChecklist } from "../domain/aksi";
import { isi } from "../lib/teks";
import { TINGKAT } from "../domain/konstanta";
import { useStore } from "../state/store";

const t = konten.ui.aksi.sendiri;

// Lakukan sendiri: langkah dengan checklist yang tersimpan di perangkat.
export function AksiSendiri() {
  const ctx = useKonteksAksi();
  const { state, toggleLangkah, setHasil } = useStore();
  if (!ctx) return <KembaliKeRencana />;

  const langkah = ctx.kartu.solusi![ctx.tingkat]!.langkah;
  const kunci = kunciChecklist(ctx.kartu.id, ctx.tingkat);
  const selesai = (state.checklist[kunci] ?? []).filter((n) => n < langkah.length);

  const semuaSelesai = selesai.length === langkah.length;
  const hasil = state.hasil[ctx.kartu.id];
  const hasilIni = hasil && hasil.tingkat === ctx.tingkat ? hasil.status : null;
  const berikut = TINGKAT.find((x) => TINGKAT.indexOf(x) > TINGKAT.indexOf(ctx.tingkat) && ctx.kartu.solusi?.[x]);
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
                className={`flex min-h-sentuh cursor-pointer items-start gap-3 rounded-kartu border p-3 ${
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
          <p key={dorongan} className="mt-4 rounded-kartu bg-utama-muda p-4 font-medium motion-safe:animate-muncul">
            {dorongan}
          </p>
        )}
      </div>
      {semuaSelesai && (
        <section className="mt-6 rounded-kartu border border-utama bg-white p-4" aria-labelledby="hasil">
          <h2 id="hasil" className="text-subjudul">
            {t.hasil.judul}
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Tombol
              gayaTombol={hasilIni === "cukup" ? "utama" : "sekunder"}
              aria-pressed={hasilIni === "cukup"}
              onClick={() => setHasil(ctx.kartu.id, hasilIni === "cukup" ? null : { status: "cukup", tingkat: ctx.tingkat })}
            >
              {t.hasil.cukup}
            </Tombol>
            <Tombol
              gayaTombol={hasilIni === "masih_sulit" ? "utama" : "sekunder"}
              aria-pressed={hasilIni === "masih_sulit"}
              onClick={() => setHasil(ctx.kartu.id, hasilIni === "masih_sulit" ? null : { status: "masih_sulit", tingkat: ctx.tingkat })}
            >
              {t.hasil.sulit}
            </Tombol>
          </div>
          <div aria-live="polite">
            {hasilIni === "cukup" && (
              <>
                <p className="mt-3 motion-safe:animate-muncul">{t.hasil.balasCukup}</p>
                <TombolLink to="/rencana" className="mt-3 w-full">
                  {t.hasil.keRencana}
                </TombolLink>
              </>
            )}
            {hasilIni === "masih_sulit" && (
              <>
                <p className="mt-3 motion-safe:animate-muncul">{berikut ? t.hasil.balasSulit : t.hasil.terakhir}</p>
                {berikut ? (
                  <TombolLink to={`/kartu/${ctx.kartu.id}/${berikut}`} className="mt-3 w-full">
                    {t.hasil.berikutnya}
                  </TombolLink>
                ) : (
                  <TombolLink to={`/aksi/ahli/${ctx.kartu.id}`} className="mt-3 w-full">
                    {konten.ui.aksi.tombol.ahli}
                  </TombolLink>
                )}
              </>
            )}
          </div>
        </section>
      )}
    </AksiHalaman>
  );
}
