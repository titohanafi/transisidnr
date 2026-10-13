import type { ReactNode } from "react";
import { konten } from "../domain/content";
import type { Kartu } from "../domain/schema";

const { umum } = konten.ui;

const dasar = "inline-block rounded-full border px-2 py-0.5 text-sm font-medium";

// Lencana "Draf" sengaja tidak ditampilkan (keputusan pemilik untuk PoC, lihat DECISIONS.md).
export function LencanaStatus({ status }: { status: Kartu["status_validasi"] }) {
  if (status === "draf") return null;
  const label = status === "ditinjau_ahli" ? umum.lencanaDitinjau : umum.lencanaDisetujui;
  return <span className={`${dasar} border-utama bg-utama-muda text-utama-gelap`}>{label}</span>;
}

export function LencanaSifat({ sifat }: { sifat: "sementara" | "permanen" }) {
  return sifat === "sementara" ? (
    <span className={`${dasar} border-utama bg-utama-muda text-utama-gelap`}>{umum.sementara}</span>
  ) : (
    <span className={`${dasar} border-aksen bg-aksen-muda text-aksen`}>{umum.permanen}</span>
  );
}

export function Tanda({ children }: { children: ReactNode }) {
  return <span className={`${dasar} border-garis bg-white text-tinta`}>{children}</span>;
}
