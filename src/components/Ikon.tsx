import type { KunciKelompok } from "../domain/jelajah";

// Ilustrasi garis sederhana (SVG sebaris, ringan, tanpa berkas gambar). Selalu dekoratif:
// artinya sudah ada di teks di sebelahnya, jadi disembunyikan dari pembaca layar.
// Hanya benda dan ruang; tanpa gambar orang, tanpa angka ukuran.

const garis = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const isi: Record<KunciKelompok, JSX.Element> = {
  // Pancuran dengan tetesan air
  mandi: (
    <g {...garis}>
      <path d="M10 42V16a8 8 0 0 1 8-8h12" />
      <path d="M24 12h12l-3 7H27z" />
      <path d="M28 25v4M32 25v6M36 25v4M30 35v4M34 36v4" />
    </g>
  ),
  // Kloset: tangki, dudukan, dan alas
  toilet: (
    <g {...garis}>
      <rect x="14" y="5" width="20" height="11" rx="2" />
      <path d="M8 21h32c0 8-4 14-10 14H18c-6 0-10-6-10-14z" />
      <path d="M19 35v7h10v-7" />
    </g>
  ),
  // Keran dengan air mengalir
  wudhu: (
    <g {...garis}>
      <path d="M8 12v8M8 12h20a8 8 0 0 1 8 8v3" />
      <path d="M17 8v4" />
      <path d="M36 29v4M36 37v4M30 33v3M42 33v3" />
    </g>
  ),
  // Cermin persegi di atas wastafel dengan keran
  grooming: (
    <g {...garis}>
      <rect x="12" y="4" width="24" height="18" rx="3" />
      <path d="M18 17l6-8M24 17l4-5" />
      <path d="M24 29v-3h5" />
      <path d="M6 31h36l-4 10H10z" />
    </g>
  ),
  // Pintu: bingkai, panel, dan gagang
  umum: (
    <g {...garis}>
      <rect x="12" y="5" width="24" height="37" rx="2" />
      <rect x="17" y="10" width="14" height="12" rx="1" />
      <circle cx="31" cy="30" r="1.8" fill="currentColor" />
      <path d="M6 42h36" />
    </g>
  ),
  // Hati: pendampingan
  caregiver: (
    <g {...garis}>
      <path d="M24 40S6 29 6 17a9 9 0 0 1 18-2 9 9 0 0 1 18 2c0 12-18 23-18 23z" />
    </g>
  ),
};

export function Ikon({ kunci, className = "h-10 w-10" }: { kunci: KunciKelompok; className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={`shrink-0 text-utama ${className}`} aria-hidden="true" focusable="false">
      {isi[kunci]}
    </svg>
  );
}

/** Ilustrasi kamar mandi ramah untuk Beranda: dinding berubin, batang pegangan, bangku mandi, pancuran. */
export function IlustrasiBeranda({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 150" className={`w-full ${className}`} aria-hidden="true" focusable="false">
      <rect width="320" height="150" rx="16" className="fill-utama-muda" />
      {/* ubin */}
      <g className="stroke-garis" strokeWidth="1.5" fill="none">
        {[64, 108, 152, 196, 240, 284].map((x) => (
          <path key={x} d={`M${x} 0V122`} />
        ))}
        {[30, 61, 92].map((y) => (
          <path key={y} d={`M0 ${y}H320`} />
        ))}
      </g>
      {/* lantai */}
      <rect y="122" width="320" height="28" className="fill-kertas" />
      <path d="M0 122H320" className="stroke-utama" strokeWidth="3" />
      {/* batang pegangan di dinding: batang dengan dua pelat penempel */}
      <g className="stroke-utama" strokeLinecap="round">
        <path d="M34 70H104" strokeWidth="8" />
        <circle cx="30" cy="70" r="9" strokeWidth="3.5" className="fill-white" />
        <circle cx="108" cy="70" r="9" strokeWidth="3.5" className="fill-white" />
        <circle cx="30" cy="70" r="2.5" className="fill-utama" stroke="none" />
        <circle cx="108" cy="70" r="2.5" className="fill-utama" stroke="none" />
      </g>
      {/* pancuran */}
      <g className="stroke-utama" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M250 122V28a12 12 0 0 1 12-12h20" />
        <path d="M274 22h30l-6 14h-18z" className="fill-white" />
      </g>
      <g className="stroke-utama" strokeWidth="3" strokeLinecap="round">
        <path d="M282 46v10M290 44v14M298 46v10M286 66v10M294 68v10" />
      </g>
      {/* bangku mandi */}
      <g className="stroke-utama" strokeWidth="5" strokeLinecap="round">
        <path d="M150 88h76" />
        <path d="M158 88l-6 34M218 88l6 34" />
      </g>
    </svg>
  );
}
