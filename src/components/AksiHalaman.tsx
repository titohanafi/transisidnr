import type { ReactNode } from "react";
import { Navigate, useParams } from "react-router-dom";
import { konten } from "../domain/content";
import { TINGKAT, type Tingkat } from "../domain/konstanta";
import type { Kartu } from "../domain/schema";
import { Halaman } from "./Halaman";
import { TombolLink } from "./Tombol";

const { kartu: tk, aksi } = konten.ui;

export interface KonteksAksi {
  kartu: Kartu;
  tingkat: Tingkat;
}

/** Memuat kartu dan tingkat dari URL untuk halaman aksi; arahkan ke Rencana bila tidak valid. */
export function useKonteksAksi(): KonteksAksi | null {
  const { id, tingkat } = useParams();
  const kartu = konten.kartu.find((k) => k.id === id);
  const t = TINGKAT.find((x) => x === tingkat);
  if (!kartu || !t || !kartu.solusi?.[t]) return null;
  return { kartu, tingkat: t };
}

export function AksiHalaman({
  judul,
  kartu,
  tingkat,
  pengantar,
  children,
}: {
  judul: string;
  kartu: Kartu;
  tingkat?: Tingkat;
  /** Kalimat penjelas di pita kepala, di bawah nama panduan. */
  pengantar?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Halaman
      judul={judul}
      kepala={
        <>
          <p className="mt-2 font-medium text-utama-gelap">
            {kartu.judul}
            {tingkat && ` · ${tk.tingkat[tingkat]}`}
          </p>
          {pengantar && <p className="mt-2 text-redup">{pengantar}</p>}
        </>
      }
    >
      <div className="flex flex-col gap-bagian">
        {children}
        <TombolLink to={`/kartu/${kartu.id}${tingkat ? `/${tingkat}` : ""}`} gayaTombol="sekunder">
          {aksi.kembaliKeKartu}
        </TombolLink>
      </div>
    </Halaman>
  );
}

export const KembaliKeRencana = () => <Navigate to="/rencana" replace />;
