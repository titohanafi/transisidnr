import { ChevronRight, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
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

  return (
    <Halaman judul={t.judul}>
      <section className="mt-4 rounded-kartu border border-garis bg-white p-4" aria-labelledby="saya-jawaban">
        <h2 id="saya-jawaban" className="text-lg font-bold">
          {t.jawabanJudul}
        </h2>
        {adaJawaban ? (
          <>
            <dl className="mt-3 space-y-3">
              <div>
                <dt className="text-sm text-redup">{t.ruangan}</dt>
                <dd className="font-medium">{ruangan?.nama ?? t.belumDipilih}</dd>
              </div>
              <div>
                <dt className="text-sm text-redup">{t.aktivitas}</dt>
                <dd>
                  <ul className="mt-1 space-y-1">
                    {status.map(([id, st]) => (
                      <li key={id} className="flex justify-between gap-3">
                        <span className="font-medium">{namaAktivitas(id)}</span>
                        <span className="text-right text-redup">{asesmen.aktivitas.status[st as keyof typeof asesmen.aktivitas.status]}</span>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-redup">{t.prioritas}</dt>
                <dd className="font-medium">
                  {state.asesmen.prioritas.length > 0 ? state.asesmen.prioritas.map(namaAktivitas).join(", ") : t.belumDipilih}
                </dd>
              </div>
            </dl>
            <TombolLink to="/mulai/1" gayaTombol="sekunder" className="mt-4 w-full">
              {t.ubah}
            </TombolLink>
          </>
        ) : (
          <>
            <p className="mt-2 text-redup">{t.belumJawab}</p>
            <TombolLink to="/mulai/1" className="mt-4 w-full">
              {t.mulai}
            </TombolLink>
          </>
        )}
      </section>

      <section className="mt-5 rounded-kartu border border-garis bg-white p-4" aria-labelledby="saya-checkin">
        <h2 id="saya-checkin" className="text-lg font-bold">
          {t.riwayatJudul}
        </h2>
        <div className="mt-3">{adaCheckin ? <RiwayatCheckin /> : <p className="text-redup">{t.riwayatKosong}</p>}</div>
      </section>

      <Link
        to="/hapus"
        className="mt-5 flex min-h-[56px] items-center gap-3 rounded-kartu border border-garis bg-white px-4 py-3"
      >
        <ShieldCheck className="h-6 w-6 shrink-0 text-utama" strokeWidth={2} aria-hidden="true" focusable="false" />
        <span className="flex-1">
          <span className="block font-semibold">{umum.dataPrivasi}</span>
          <span className="block text-sm text-redup">{t.dataIsi}</span>
        </span>
        <ChevronRight className="h-6 w-6 shrink-0 text-redup" strokeWidth={2} aria-hidden="true" focusable="false" />
      </Link>
    </Halaman>
  );
}
