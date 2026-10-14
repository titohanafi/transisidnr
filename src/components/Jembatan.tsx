import type { ReactNode } from "react";

/** Kalimat pengantar singkat di atas tombol, supaya orang tahu kenapa tombol itu ada. */
export function Jembatan({ teks, children }: { teks: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-redup">{teks}</p>
      {children}
    </div>
  );
}
