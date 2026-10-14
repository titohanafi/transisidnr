import type { ReactNode } from "react";
import type { Tingkat } from "../domain/konstanta";

// Ilustrasi selebar panel untuk pilihan solusi. Dibuat bertahap: baru panduan yang ada di daftar ini yang punya
// ilustrasi (kunci "idKartu:tingkat"); panduan lain tidak menampilkan apa pun. Dekoratif, hanya benda dan situasinya
// (tanpa orang, ukuran, atau cara pasang), dan warnanya mengikuti token Tailwind.

const Lantai = ({ children }: { children: ReactNode }) => (
  <>
    <rect width="360" height="150" className="fill-permukaan" />
    <path d="M0 40h360M0 72h360M60 8v64M120 8v64M180 8v64M240 8v64M300 8v64" strokeWidth="1.5" className="stroke-white" fill="none" />
    <rect y="100" width="360" height="50" className="fill-utama" opacity="0.14" />
    <rect y="98" width="360" height="5" className="fill-utama" opacity="0.28" />
    {children}
  </>
);

const GAMBAR: Record<string, () => ReactNode> = {
  // Jaga lantai tetap kering dan bersih dari benda yang menghalangi.
  "bath-floor-slip:tanpa_biaya": () => (
    <Lantai>
      <ellipse cx="120" cy="124" rx="52" ry="9" className="fill-daun" opacity="0.45" />
      <path d="M96 118q8-3 16 0M126 128q8-3 16 0" fill="none" strokeWidth="2.500" strokeLinecap="round" className="stroke-white" />
      <path d="M236 14L186 112" strokeWidth="6" strokeLinecap="round" className="stroke-utama" />
      <rect x="162" y="106" width="58" height="16" rx="6" className="fill-utama" />
      <path d="M168 122v8M180 122v8M192 122v8M204 122v8M214 122v8" strokeWidth="3" strokeLinecap="round" className="stroke-utama" />
      <path d="M262 94h40l-5 32h-30z" className="fill-utama" />
      <path d="M262 94q20-14 40 0" fill="none" strokeWidth="4" strokeLinecap="round" className="stroke-utama" />
      <path d="M52 100l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" className="fill-daun" />
      <path d="M322 54l2.500 6 6 2.500-6 2.500-2.500 6-2.500-6-6-2.500 6-2.500z" className="fill-daun" opacity="0.7" />
    </Lantai>
  ),
  // Pasang keset atau stiker anti-slip di area berpindah dan area mandi.
  "bath-floor-slip:alat_tanpa_bongkar": () => (
    <Lantai>
      <path d="M78 136l34-30h136l34 30z" strokeLinejoin="round" strokeWidth="6" className="fill-utama stroke-utama" />
      <g className="fill-white" opacity="0.5">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
          <circle key={`a${i}`} cx={132 + i * 11.5} cy="115" r="2" />
        ))}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
          <circle key={`b${i}`} cx={118 + i * 12.8} cy="124" r="2.200" />
        ))}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
          <circle key={`c${i}`} cx={104 + i * 13.5} cy="132" r="2.400" />
        ))}
      </g>
      <rect x="40" y="108" width="34" height="9" rx="4.500" className="fill-daun" transform="rotate(-8 57 112)" />
      <rect x="44" y="124" width="34" height="9" rx="4.500" className="fill-daun" opacity="0.7" transform="rotate(6 61 128)" />
      <circle cx="318" cy="52" r="11" className="fill-daun" />
      <path
        d="M312 52l4.500 4.500L325 47"
        fill="none"
        strokeWidth="3.500"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-white"
      />
    </Lantai>
  ),
  // Ganti lantai dengan permukaan anti-slip, perbaiki kemiringan ke saluran.
  "bath-floor-slip:renovasi": () => (
    <Lantai>
      <path
        d="M0 112h360M0 126h360M0 140h360M60 104v46M120 104v46M240 104v46M300 104v46"
        strokeWidth="1.800"
        fill="none"
        className="stroke-white"
      />
      <rect x="150" y="108" width="60" height="22" rx="6" className="fill-utama" />
      <path d="M162 108v22M174 108v22M186 108v22M198 108v22" strokeWidth="3" className="stroke-white" opacity="0.6" />
      <path
        d="M40 92q30 14 70 22M320 92q-30 14 -70 22"
        fill="none"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="1 10"
        className="stroke-daun"
      />
      <circle cx="70" cy="98" r="3.500" className="fill-daun" />
      <circle cx="290" cy="98" r="3.500" className="fill-daun" />
      <circle cx="108" cy="116" r="3.500" className="fill-daun" opacity="0.7" />
      <circle cx="252" cy="116" r="3.500" className="fill-daun" opacity="0.7" />
      <g transform="rotate(-35 300 40)">
        <rect x="296" y="14" width="8" height="46" rx="4" className="fill-daun" />
        <rect x="284" y="8" width="32" height="14" rx="4" className="fill-utama" />
      </g>
    </Lantai>
  ),
};

/** Ilustrasi selebar panel untuk satu pilihan solusi; null bila panduan itu belum punya ilustrasi. */
export function IlustrasiSolusi({ kartuId, tingkat }: { kartuId: string; tingkat: Tingkat }) {
  const Gambar = GAMBAR[`${kartuId}:${tingkat}`];
  if (!Gambar) return null;
  return (
    <svg viewBox="0 0 360 150" className="block h-auto w-full" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid slice">
      <Gambar />
    </svg>
  );
}
