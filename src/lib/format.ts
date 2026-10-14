import type { Rentang } from "../domain/engine";

export const formatRp = (n: number): string => "Rp " + n.toLocaleString("id-ID");

export function formatRentang({ min, max }: Rentang): string {
  return min === max ? formatRp(min) : `${formatRp(min)} - ${formatRp(max)}`;
}

const satuan = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} jt`;
  if (n >= 1_000) return `${(n / 1_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} rb`;
  return String(n);
};

/** Menyingkat teks rupiah untuk pil: "Rp 150.000 - Rp 1.500.000" menjadi "Rp 150 rb - 1,5 jt". Teks tanpa angka rupiah dikembalikan apa adanya. */
export function ringkasRp(teks: string): string {
  const angka = [...teks.matchAll(/Rp\s*([\d.]+)/g)].map((m) => Number(m[1].replace(/\./g, "")));
  if (angka.length === 0 || angka.some((n) => Number.isNaN(n))) return teks;
  if (angka.length === 1) return `Rp ${satuan(angka[0])}`;
  return `Rp ${satuan(angka[0])} - ${satuan(angka[1])}`;
}
