import type { Rentang } from "../domain/engine";

export const formatRp = (n: number): string => "Rp " + n.toLocaleString("id-ID");

export function formatRentang({ min, max }: Rentang): string {
  return min === max ? formatRp(min) : `${formatRp(min)} - ${formatRp(max)}`;
}
