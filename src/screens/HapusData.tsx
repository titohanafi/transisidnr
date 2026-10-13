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
    <Halaman judul={t.judul}>
      {tahap === "selesai" ? (
        <>
          <p role="status" className="mt-4 rounded-kartu border border-utama bg-utama-muda p-3">
            {t.selesai}
          </p>
          <TombolLink to="/" className="mt-6">
            {umum.keBeranda}
          </TombolLink>
        </>
      ) : (
        <>
          <p className="mt-4">{umum.privasi}</p>
          <p className="mt-3">{t.penjelasan}</p>
          {tahap === "awal" ? (
            <Tombol gayaTombol="bahaya" className="mt-6" onClick={() => setTahap("yakin")}>
              {t.tombol}
            </Tombol>
          ) : (
            <div role="alert" className="mt-6 rounded-kartu border-2 border-bahaya p-3">
              <p className="font-semibold">{t.konfirmasi}</p>
              <div className="mt-3 flex gap-3">
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
          <TombolLink to="/" gayaTombol="sekunder" className="mt-6">
            {umum.keBeranda}
          </TombolLink>
        </>
      )}
    </Halaman>
  );
}
