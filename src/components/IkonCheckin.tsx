// Ikon garis untuk tiap jawaban check-in (SVG sebaris, dekoratif). Bentuknya berbeda-beda, bukan hanya warna.
// Bukan wajah dan bukan skor: hanya benda yang melambangkan keadaan.
const garis = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const isi: Record<string, JSX.Element> = {
  // Baterai hampir habis
  capek_fisik: (
    <g {...garis}>
      <rect x="3" y="8" width="16" height="9" rx="2" />
      <path d="M21 11v3M6 11v3" />
    </g>
  ),
  // Hati
  capek_emosi: <path {...garis} d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" />,
  // Tanda tanya
  bingung_langkah: (
    <g {...garis}>
      <path d="M9 9a3 3 0 1 1 4.5 2.6c-1 .6-1.5 1.2-1.5 2.4" />
      <path d="M12 18v.01" />
    </g>
  ),
  // Koin
  soal_biaya: (
    <g {...garis}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v8M9.5 10.5c0-1 1-1.5 2.5-1.5s2.5.6 2.5 1.5-1 1.3-2.5 1.5-2.5.7-2.5 1.5 1 1.5 2.5 1.5 2.5-.5 2.5-1.5" />
    </g>
  ),
  // Bulan
  butuh_istirahat: <path {...garis} d="M19 14.5A8 8 0 0 1 9.5 5a8 8 0 1 0 9.5 9.5z" />,
};

export function IkonCheckin({ id, className = "h-6 w-6" }: { id: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      {isi[id] ?? <circle cx="12" cy="12" r="2" fill="currentColor" />}
    </svg>
  );
}
