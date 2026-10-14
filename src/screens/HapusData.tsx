import { CircleCheck, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Halaman } from "../components/Halaman";
import { Tombol, TombolLink } from "../components/Tombol";
import { konten } from "../domain/content";
import { useStore } from "../state/store";

const { hapusData: t, umum } = konten.ui;

export function HapusData() {
  const { hapusSemua } = useStore();
  const [tahap, setTahap] = useState<"awal" | "yakin" | "selesai">("awal");

  return (
    <Halaman judul={t.judul} kepala={<p className="mt-2 text-redup">{umum.privasi}</p>}>
      <div className="flex flex-col gap-bagian">
        {tahap === "selesai" ? (
          <>
            <p role="status" className="flex items-start gap-3 rounded-kartu bg-utama-muda p-5">
              <CircleCheck className="mt-0.5 h-6 w-6 shrink-0 text-utama" strokeWidth={2} aria-hidden="true" focusable="false" />
              <span>{t.selesai}</span>
            </p>
            <TombolLink to="/">{umum.keBeranda}</TombolLink>
          </>
        ) : (
          <>
            <section className="rounded-kartu border border-garis/70 bg-white p-5 shadow-kartu">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-tombol bg-utama-muda">
                  <ShieldCheck className="h-6 w-6 text-utama" strokeWidth={2} aria-hidden="true" focusable="false" />
                </span>
                <p className="pt-1.5">{t.penjelasan}</p>
              </div>
              {tahap === "awal" ? (
                <Tombol gayaTombol="bahaya" className="mt-5 w-full" onClick={() => setTahap("yakin")}>
                  {t.tombol}
                </Tombol>
              ) : (
                <div role="alert" className="mt-5 rounded-kartu border border-bahaya/25 bg-bahaya-muda p-4">
                  <p className="font-semibold">{t.konfirmasi}</p>
                  <div className="mt-4 flex gap-3">
                    <Tombol gayaTombol="sekunder" className="flex-1" onClick={() => setTahap("awal")}>
                      {t.batal}
                    </Tombol>
                    <Tombol
                      gayaTombol="bahaya"
                      className="flex-1"
                      onClick={() => {
                        hapusSemua();
                        setTahap("selesai");
                      }}
                    >
                      {t.ya}
                    </Tombol>
                  </div>
                </div>
              )}
            </section>
            <TombolLink to="/" gayaTombol="sekunder">
              {umum.keBeranda}
            </TombolLink>
          </>
        )}
      </div>
    </Halaman>
  );
}
