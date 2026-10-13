import type { ReactNode } from "react";
import { konten } from "../domain/content";
import type { Kartu } from "../domain/schema";

const { umum } = konten.ui;

const dasar = "inline-block rounded-full border px-2 py-0.5 text-sm font-medium";

export function LencanaStatus({ status }: { status: Kartu["status_validasi"] }) {
  const label = { draf: umum.lencanaDraf, ditinjau_ahli: umum.lencanaDitinjau, disetujui: umum.lencanaDisetujui }[status];
  const warna = status === "draf" ? "border-draf bg-draf-muda text-draf" : "border-utama bg-utama-muda text-utama-gelap";
  return <span className={`${dasar} ${warna}`}>{label}</span>;
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
