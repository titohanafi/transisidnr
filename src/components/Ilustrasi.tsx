import type { KunciKelompok } from "../domain/jelajah";

// Ilustrasi sederhana per kelompok aktivitas: SVG inline kecil (tanpa gambar unduhan), hanya benda dan situasinya,
// tanpa orang, ukuran, atau cara pasang. Dekoratif: artinya sudah ada di teks, jadi disembunyikan dari pembaca layar.
// Warna mengikuti token Tailwind (utama, daun) supaya ikut berganti bila palet diganti.
const Dasar = () => <circle cx="60" cy="48" r="44" className="fill-white" />;

const GAMBAR: Record<KunciKelompok, () => JSX.Element> = {
  mandi: () => (
    <>
      <Dasar />
      <path d="M32 78V30q0-10 10-10h22" fill="none" strokeWidth="5" strokeLinecap="round" className="stroke-utama" />
      <rect x="58" y="16" width="34" height="9" rx="4.5" className="fill-utama" />
      <path d="M62 29l-3 7M70 29v9M78 29v7M86 29l3 7" strokeWidth="2.5" strokeLinecap="round" className="stroke-daun" />
      <circle cx="62" cy="48" r="3" className="fill-daun" />
      <circle cx="72" cy="54" r="3" className="fill-daun" />
      <circle cx="82" cy="46" r="3" className="fill-daun" />
      <circle cx="68" cy="66" r="3" className="fill-daun" />
      <circle cx="80" cy="64" r="3" className="fill-daun" />
      <rect x="24" y="78" width="72" height="7" rx="3.5" className="fill-utama" />
    </>
  ),
  toilet: () => (
    <>
      <Dasar />
      <rect x="34" y="20" width="24" height="28" rx="5" className="fill-utama" />
      <path d="M28 52h50q0 16-17 22v12H45V74q-17-6-17-22z" className="fill-utama" />
      <rect x="24" y="46" width="58" height="8" rx="4" className="fill-daun" />
      <rect x="40" y="26" width="12" height="4" rx="2" className="fill-white" />
      <rect x="22" y="86" width="76" height="5" rx="2.5" className="fill-utama" opacity="0.25" />
    </>
  ),
  wudhu: () => (
    <>
      <Dasar />
      <path d="M30 40V30q0-8 8-8h26q8 0 8 8v4" fill="none" strokeWidth="6" strokeLinecap="round" className="stroke-utama" />
      <rect x="60" y="30" width="12" height="9" rx="2" className="fill-utama" />
      <path d="M66 46q-5 7-5 11a5 5 0 0010 0q0-4-5-11z" className="fill-daun" />
      <path d="M66 62q-3 4-3 6.5a3 3 0 006 0q0-2.500-3-6.500z" className="fill-daun" opacity="0.6" />
      <path d="M34 70h26l-3 18H37z" className="fill-utama" />
      <rect x="31" y="66" width="32" height="6" rx="3" className="fill-utama" />
    </>
  ),
  grooming: () => (
    <>
      <Dasar />
      <circle cx="56" cy="42" r="23" strokeWidth="6" className="fill-white stroke-utama" />
      <path d="M46 34q4-6 11-6" fill="none" strokeWidth="3" strokeLinecap="round" className="stroke-daun" />
      <rect x="53" y="64" width="6" height="22" rx="3" className="fill-utama" />
      <path d="M90 22l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" className="fill-daun" />
      <path d="M26 66l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" className="fill-daun" opacity="0.6" />
    </>
  ),
  umum: () => (
    <>
      <Dasar />
      <rect x="36" y="16" width="46" height="70" rx="4" className="fill-utama" />
      <path d="M36 16l-14 8v62l14-4z" className="fill-utama" opacity="0.45" />
      <circle cx="74" cy="52" r="3.500" className="fill-daun" />
      <rect x="44" y="26" width="30" height="22" rx="3" className="fill-white" opacity="0.18" />
      <rect x="18" y="86" width="84" height="5" rx="2.5" className="fill-utama" opacity="0.25" />
    </>
  ),
  caregiver: () => (
    <>
      <Dasar />
      <path d="M60 78C34 62 28 46 36 36c7-8 18-5 24 3 6-8 17-11 24-3 8 10 2 26-24 42z" className="fill-utama" />
      <path d="M44 48q8-8 16 0" fill="none" strokeWidth="3" strokeLinecap="round" className="stroke-white" opacity="0.7" />
      <circle cx="88" cy="26" r="5" className="fill-daun" />
      <circle cx="30" cy="70" r="3.500" className="fill-daun" opacity="0.6" />
    </>
  ),
};

export function Ilustrasi({ kunci, className = "h-24 w-28" }: { kunci: KunciKelompok; className?: string }) {
  const Gambar = GAMBAR[kunci];
  return (
    <svg viewBox="0 0 120 96" className={`shrink-0 ${className}`} aria-hidden="true" focusable="false">
      <Gambar />
    </svg>
  );
}
