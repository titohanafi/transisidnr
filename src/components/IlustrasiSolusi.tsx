import type { ReactNode } from "react";
import type { Tingkat } from "../domain/konstanta";

// Ilustrasi selebar panel untuk pilihan solusi. Dibuat bertahap: baru panduan yang ada di daftar ini yang punya
// ilustrasi (kunci "idKartu:tingkat"); panduan lain tidak menampilkan apa pun. Gaya: garis tipis (seperti gambar teknik),
// isian tonal dari warna utama, satu aksen kecil. Dekoratif; hanya benda dan situasinya (tanpa orang, ukuran, atau cara pasang).

const LANTAI_ATAS = 92;
const garisLantai = (n: number) =>
  Array.from({ length: n }, (_, i) => {
    const bawah = -120 + (i * 600) / (n - 1);
    const atas = 180 + (bawah - 180) * 0.55;
    return `M${atas.toFixed(1)} ${LANTAI_ATAS}L${bawah.toFixed(1)} 150`;
  }).join("");

/** Dinding berubin tipis di atas, lantai berperspektif di bawah. */
const Ruang = ({ children }: { children: ReactNode }) => (
  <>
    <rect width="360" height="150" className="fill-white" />
    <path d="M0 30h360M0 62h360M45 0v92M135 0v92M225 0v92M315 0v92" fill="none" strokeWidth="1" className="stroke-garis" />
    <path d={`M0 ${LANTAI_ATAS}h360v58H0z`} className="fill-permukaan" />
    <path d={garisLantai(13)} fill="none" strokeWidth="1" className="stroke-white" opacity="0.9" />
    <path d={`M0 ${LANTAI_ATAS + 20}h360M0 ${LANTAI_ATAS + 40}h360`} fill="none" strokeWidth="1" className="stroke-white" opacity="0.9" />
    <path d={`M0 ${LANTAI_ATAS}h360`} fill="none" strokeWidth="2" className="stroke-utama" opacity="0.35" />
    {children}
  </>
);

const garis = { fill: "none", strokeWidth: 2.5, strokeLinecap: "round", strokeLinejoin: "round" } as const;

const GAMBAR: Record<string, () => ReactNode> = {
  // Jaga lantai tetap kering dan bersih dari benda yang menghalangi.
  "bath-floor-slip:tanpa_biaya": () => (
    <Ruang>
      {/* Pancuran di dinding, dalam keadaan mati. */}
      <path d="M58 6v30q0 8 8 8h28" {...garis} strokeWidth="3" className="stroke-utama" />
      <rect x="92" y="38" width="40" height="11" rx="5.500" className="fill-white" />
      <rect x="92" y="38" width="40" height="11" rx="5.500" {...garis} className="stroke-utama" />
      <circle cx="58" cy="62" r="7" className="fill-white" />
      <circle cx="58" cy="62" r="7" {...garis} strokeWidth="2" className="stroke-utama" />
      <path d="M58 58v8" {...garis} strokeWidth="2" className="stroke-daun" />
      {/* Saluran lantai. */}
      <ellipse cx="112" cy="124" rx="22" ry="6" className="fill-white" />
      <ellipse cx="112" cy="124" rx="22" ry="6" {...garis} strokeWidth="2" className="stroke-utama" />
      <path
        d="M98 124h28M104 121.500v5M112 121.500v5M120 121.500v5"
        {...garis}
        strokeWidth="1.500"
        className="stroke-utama"
        opacity="0.6"
      />
      {/* Kloset. */}
      <rect x="262" y="40" width="34" height="30" rx="5" className="fill-white" />
      <rect x="262" y="40" width="34" height="30" rx="5" {...garis} className="stroke-utama" />
      <ellipse cx="285" cy="122" rx="30" ry="4" className="fill-utama" opacity="0.14" />
      <path d="M252 78h66v6q0 14-18 18v14h-30v-14q-18-4-18-18z" className="fill-white" />
      <path d="M252 78h66v6q0 14-18 18v14h-30v-14q-18-4-18-18z" {...garis} className="stroke-utama" />
      <path d="M252 78h66" {...garis} strokeWidth="3" className="stroke-utama" />
      {/* Kilau tanda lantai bersih dan kering. */}
      <path d="M170 112l14-10M186 120l18-14M214 126l16-12" {...garis} strokeWidth="3" className="stroke-white" />
    </Ruang>
  ),
  // Pasang keset atau stiker anti-slip di area berpindah dan area mandi.
  "bath-floor-slip:alat_tanpa_bongkar": () => (
    <Ruang>
      <path d="M84 138l38-34h116l38 34z" className="fill-white" />
      <path d="M84 138l38-34h116l38 34z" {...garis} className="stroke-utama" />
      <path d="M84 138v6h192v-6" className="fill-white" />
      <path d="M84 138v6h192v-6" {...garis} strokeWidth="2" className="stroke-utama" />
      <g className="fill-utama" opacity="0.55">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
          <circle key={`a${i}`} cx={142 + i * 8.2} cy="110" r="1.500" />
        ))}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
          <circle key={`b${i}`} cx={130 + i * 9.8} cy="120" r="1.700" />
        ))}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
          <circle key={`c${i}`} cx={118 + i * 11} cy="130" r="1.900" />
        ))}
      </g>
      <path d="M36 112h32l6 7H42z" className="fill-white" />
      <path d="M36 112h32l6 7H42z" {...garis} strokeWidth="2" className="stroke-daun" />
      <path d="M30 126h32l6 7H36z" className="fill-white" />
      <path d="M30 126h32l6 7H36z" {...garis} strokeWidth="2" className="stroke-daun" />
    </Ruang>
  ),
  // Ganti lantai dengan permukaan anti-slip, perbaiki kemiringan ke saluran.
  "bath-floor-slip:renovasi": () => (
    <Ruang>
      <path d="M150 112h60l8 20h-76z" className="fill-white" />
      <path d="M150 112h60l8 20h-76z" {...garis} className="stroke-utama" />
      <path d="M166 118l-4 10M178 118l-2 10M190 118v10M202 118l2 10M214 118l4 10" {...garis} strokeWidth="2" className="stroke-utama" />
      <path d="M52 108q36 4 84 12M308 108q-36 4 -84 12" {...garis} strokeWidth="2" strokeDasharray="2 6" className="stroke-daun" />
      <path d="M128 117l9 3-8 5M232 117l-9 3 8 5" {...garis} strokeWidth="2" className="stroke-daun" />
      <g transform="rotate(-8 292 36)">
        <rect x="244" y="26" width="96" height="20" rx="4" className="fill-white" />
        <rect x="244" y="26" width="96" height="20" rx="4" {...garis} className="stroke-utama" />
        <path d="M262 26v8M280 26v6M298 26v8M316 26v6" {...garis} strokeWidth="1.800" className="stroke-utama" />
        <rect x="282" y="32" width="20" height="9" rx="4.500" {...garis} strokeWidth="1.800" className="fill-white stroke-utama" />
      </g>
    </Ruang>
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
