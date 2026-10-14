import { CalendarDays, ClipboardList, ShieldCheck, type LucideIcon } from "lucide-react";
import { BarisTautan } from "../components/BarisTautan";
import { RiwayatCheckin } from "../components/CheckIn";
import { Halaman } from "../components/Halaman";
import { TombolLink } from "../components/Tombol";
import { konten } from "../domain/content";
import { useRuangan } from "../state/useRuangan";
import { useStore } from "../state/store";

const { saya: t, umum, asesmen } = konten.ui;

const namaAktivitas = (id: string) => konten.asesmen.aktivitas.find((a) => a.id === id)?.label.split(" (")[0] ?? id;

// Ruang pribadi di perangkat: ringkasan jawaban, riwayat check-in, dan pengelolaan data.
// Nanti bisa menampung checklist perkembangan (butuh konten yang ditinjau ahli lebih dulu).
export function Saya() {
  const { state } = useStore();
  const { ruangan } = useRuangan();
  const status = Object.entries(state.asesmen.status);
  const adaJawaban = status.length > 0;
  const adaCheckin = Object.keys(state.riwayatCheckin).length > 0;

  const judulKartu = (id: string, Ikon: LucideIcon, teks: string) => (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-tombol bg-utama-muda">
        <Ikon className="h-6 w-6 text-utama" strokeWidth={2} aria-hidden="true" focusable="false" />
      </span>
      <h2 id={id} className="text-subjudul">
        {teks}
      </h2>
    </div>
  );

  return (
    <Halaman judul={t.judul} kepala={<p className="mt-2 text-redup">{t.pengantar}</p>}>
      <div className="flex flex-col gap-bagian">
        <section className="rounded-kartu border border-garis/70 bg-white p-5 shadow-kartu" aria-labelledby="saya-jawaban">
          {judulKartu("saya-jawaban", ClipboardList, t.jawabanJudul)}
          {adaJawaban ? (
            <>
              <dl className="mt-4 divide-y divide-garis/60">
                <div className="pb-3">
                  <dt className="text-kecil text-redup">{t.ruangan}</dt>
                  <dd className="font-medium">{ruangan?.nama ?? t.belumDipilih}</dd>
                </div>
                <div className="py-3">
                  <dt className="text-kecil text-redup">{t.aktivitas}</dt>
                  <dd>
                    <ul className="mt-1 space-y-1">
                      {status.map(([id, st]) => (
                        <li key={id} className="flex justify-between gap-3">
                          <span className="font-medium">{namaAktivitas(id)}</span>
                          <span className="text-right text-redup">
                            {asesmen.aktivitas.status[st as keyof typeof asesmen.aktivitas.status]}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
                <div className="pt-3">
                  <dt className="text-kecil text-redup">{t.prioritas}</dt>
                  <dd className="font-medium">
                    {state.asesmen.prioritas.length > 0 ? state.asesmen.prioritas.map(namaAktivitas).join(", ") : t.belumDipilih}
                  </dd>
                </div>
              </dl>
              <TombolLink to="/mulai/1" gayaTombol="sekunder" className="mt-5 w-full">
                {t.ubah}
              </TombolLink>
            </>
          ) : (
            <>
              <p className="mt-3 text-redup">{t.belumJawab}</p>
              <TombolLink to="/mulai/1" className="mt-5 w-full">
                {t.mulai}
              </TombolLink>
            </>
          )}
        </section>

        <section className="rounded-kartu border border-garis/70 bg-white p-5 shadow-kartu" aria-labelledby="saya-checkin">
          {judulKartu("saya-checkin", CalendarDays, t.riwayatJudul)}
          <div className="mt-4">{adaCheckin ? <RiwayatCheckin /> : <p className="text-redup">{t.riwayatKosong}</p>}</div>
        </section>

        <BarisTautan ke="/hapus" teks={umum.dataPrivasi} keterangan={t.dataIsi} Ikon={ShieldCheck} />
      </div>
    </Halaman>
  );
}
