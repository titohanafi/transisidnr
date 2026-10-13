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

const ikonAksi = {
  // Batang pegangan di dinding
  alat: (
    <g {...garis}>
      <path d="M6 20h36M12 20v12M36 20v12" />
      <path d="M6 12h36" opacity=".35" />
    </g>
  ),
  // Palu
  tukang: (
    <g {...garis}>
      <path d="M8 10h22v10H8z" />
      <path d="M30 15h8M19 20v22" />
    </g>
  ),
  // Kamera
  foto: (
    <g {...garis}>
      <path d="M6 16h8l3-5h14l3 5h8v22H6z" />
      <circle cx="24" cy="26" r="7" />
    </g>
  ),
  // Gelembung percakapan
  ahli: (
    <g {...garis}>
      <path d="M8 10h32v22H23l-9 8v-8H8z" />
      <path d="M16 19h16M16 25h10" />
    </g>
  ),
} as const;

export function IkonAksi({ kunci, className = "h-10 w-10" }: { kunci: keyof typeof ikonAksi; className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={`shrink-0 text-utama ${className}`} aria-hidden="true" focusable="false">
      {ikonAksi[kunci]}
    </svg>
  );
}

/**
 * Ilustrasi Beranda: alat bantu gerak yang ditanyakan di onboarding (kursi roda, kruk, walker).
 * Hanya benda, tanpa gambar orang. Warna mengikuti token tailwind.
 */
export function IlustrasiBeranda({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 150" className={`w-full ${className}`} aria-hidden="true" focusable="false">
      <rect width="320" height="150" rx="16" className="fill-utama-muda" />
      <rect y="122" width="320" height="28" className="fill-kertas" />
      <path d="M0 122H320" className="stroke-utama" strokeWidth="3" />

      <g className="stroke-utama" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* kursi roda (tampak samping) */}
        <g strokeWidth="4.5">
          <circle cx="70" cy="88" r="34" />
          <circle cx="70" cy="88" r="26" strokeWidth="2" />
          <circle cx="122" cy="112" r="10" />
          <path d="M52 38h14M58 40L62 78H112" />
          <path d="M112 78L126 98h16" />
          <path d="M64 60h38V78" />
          <path d="M70 88V78" />
        </g>
        <circle cx="70" cy="88" r="4" className="fill-utama" stroke="none" />

        {/* sepasang kruk */}
        <g strokeWidth="4.5">
          <path d="M184 28h22M195 28L205 122M193 68h14" />
          <path d="M211 28h22M222 28L232 122M220 68h14" />
        </g>

        {/* walker */}
        <g strokeWidth="4.5">
          <path d="M262 50h38M262 50V122M300 50V122M262 86h38" />
          <path d="M254 50h14M294 50h14" strokeWidth="8" />
        </g>
      </g>
    </svg>
  );
}
