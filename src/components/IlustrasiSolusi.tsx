import type { ReactNode } from "react";
import { konten } from "../domain/content";
import type { Tingkat } from "../domain/konstanta";
import { Dinding, KursiRodaAtas, Kanvas, Panah, Pengguna, UkurMendatar, UkurTegak, angka, garisTinta } from "./GambarTeknis";

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
  // Pastikan pintu bisa dibuka leluasa: pintu terbuka penuh dan diganjal, jalur di depan pintu kosong.
  "bath-door:tanpa_biaya": () => (
    <Kanvas>
      <Dinding x1={0} x2={160} y={56} />
      <Dinding x1={220} x2={360} y={56} />
      <path d="M160 64A60 60 0 0 1 220 4" {...garisTinta} strokeWidth="1.500" strokeDasharray="4 5" className="stroke-tinta" />
      <path d="M220 64V4" {...garisTinta} strokeWidth="5" className="stroke-tinta" />
      <path d="M160 94V146M220 94V146" {...garisTinta} strokeWidth="1.500" strokeDasharray="4 5" className="stroke-tinta" opacity="0.5" />
      <UkurMendatar x1={160} x2={220} y={86} angka={angka("bukaanPintu")} />
      <KursiRodaAtas x={190} y={126} />
      <path d="M190 106V96" {...garisTinta} strokeWidth="2.500" className="stroke-tinta" />
      <Panah x={190} y={94} arah={-90} />
    </Kanvas>
  ),
  // Tambahkan alat yang bisa dilepas: tali di gagang supaya pintu bisa ditarik dari posisi duduk, ganjal di lantai.
  "bath-door:alat_tanpa_bongkar": () => (
    <Kanvas>
      <g transform="translate(-30 0)">
        <path d="M0 138H360" {...garisTinta} strokeWidth="3" className="stroke-tinta" />
        <rect x="244" y="6" width="8" height="132" className="fill-white stroke-tinta" strokeWidth="3" />
        <path d="M244 38h-12" {...garisTinta} strokeWidth="5" className="stroke-tinta" />
        <path d="M229 38V64q0 10-7 10t-7-10V44" {...garisTinta} strokeWidth="3" className="stroke-tinta" />
        <path d="M232 138h12v-9z" className="fill-tinta" />
        <Pengguna x={170} y={138} tangan={[222, 58]} />
        <path d="M252 16H282M252 52H282" {...garisTinta} strokeWidth="1.500" strokeDasharray="4 4" className="stroke-tinta" opacity="0.5" />
        <UkurTegak x={286} y1={16} y2={52} angka={angka("tinggiGagang")} />
      </g>
    </Kanvas>
  ),
  // Ubah pintu secara permanen: pintu geser, bukaan lega tanpa ruang putar daun pintu.
  "bath-door:renovasi": () => (
    <Kanvas>
      <Dinding x1={0} x2={120} y={56} />
      <Dinding x1={200} x2={360} y={56} />
      <path d="M200 68H300" {...garisTinta} strokeWidth="5" className="stroke-tinta" />
      <path d="M120 68H200" {...garisTinta} strokeWidth="2" strokeDasharray="4 4" className="stroke-tinta" opacity="0.6" />
      <path d="M226 68h14" {...garisTinta} strokeWidth="2" className="stroke-white" />
      <path d="M134 80H178" {...garisTinta} strokeWidth="2.500" className="stroke-tinta" />
      <Panah x={190} y={80} arah={0} />
      <UkurMendatar x1={120} x2={200} y={100} angka={angka("bukaanPintu")} />
      <path d="M160 116V108" {...garisTinta} strokeWidth="2.500" className="stroke-tinta" />
      <Panah x={160} y={106} arah={-90} />
      <KursiRodaAtas x={160} y={132} />
    </Kanvas>
  ),
  // Sepakati cara memanggil: pengguna memanggil dari kamar mandi, ponsel di tempat yang terjangkau, pintu tidak dikunci.
  "bath-emergency-call:tanpa_biaya": () => (
    <Kanvas>
      <path d="M0 138H360" {...garisTinta} strokeWidth="3" className="stroke-tinta" />
      <Pengguna x={90} y={138} tangan={[18, -134]} />
      <path
        d="M128 22A14 14 0 0 1 128 40M138 14A26 26 0 0 1 138 48M148 6A38 38 0 0 1 148 56"
        {...garisTinta}
        strokeWidth="2.500"
        className="stroke-tinta"
      />
      <rect x="250" y="22" width="76" height="116" className="fill-white stroke-tinta" strokeWidth="3" />
      <path d="M250 22L226 12V134L250 138z" className="fill-white stroke-tinta" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="234" cy="76" r="3.500" className="fill-tinta" />
    </Kanvas>
  ),
  // Tambahkan alat panggil yang bisa dilepas: tombol panggil nirkabel di satu ruangan, penerima di ruangan lain.
  "bath-emergency-call:alat_tanpa_bongkar": () => (
    <Kanvas>
      <path d="M0 138H360" {...garisTinta} strokeWidth="3" className="stroke-tinta" />
      <rect x="176" y="0" width="8" height="138" className="fill-tinta" />
      <rect x="60" y="44" width="52" height="52" rx="12" className="fill-white stroke-tinta" strokeWidth="3" />
      <circle cx="86" cy="36" r="6" className="fill-white stroke-tinta" strokeWidth="3" />
      <path d="M86 42V44" {...garisTinta} strokeWidth="3" className="stroke-tinta" />
      <circle cx="86" cy="70" r="16" className="fill-white stroke-tinta" strokeWidth="3" />
      <circle cx="86" cy="70" r="6" className="fill-tinta" />
      <path
        d="M122.700 61A14 14 0 0 1 122.700 79M132 53.300A26 26 0 0 1 132 86.700M141.100 45.600A38 38 0 0 1 141.100 94.400M150.300 37.900A50 50 0 0 1 150.300 102.100M159.500 30.200A62 62 0 0 1 159.500 109.800"
        {...garisTinta}
        strokeWidth="2.500"
        className="stroke-tinta"
      />
      <rect x="232" y="50" width="60" height="40" rx="8" className="fill-white stroke-tinta" strokeWidth="3" />
      <path d="M246 62H278M246 70H278M246 78H278" {...garisTinta} strokeWidth="3" className="stroke-tinta" />
      <path d="M300 62A12 12 0 0 1 300 78M308 56A22 22 0 0 1 308 84" {...garisTinta} strokeWidth="2.500" className="stroke-tinta" />
    </Kanvas>
  ),
  // Pasang sistem panggil permanen: tombol dan tali panggil di dinding dekat kloset, terhubung ke bel di ruangan lain.
  "bath-emergency-call:renovasi": () => (
    <Kanvas>
      <path d="M0 138H360" {...garisTinta} strokeWidth="3" className="stroke-tinta" />
      <rect x="250" y="0" width="12" height="138" className="fill-tinta" />
      <rect x="212" y="64" width="28" height="40" rx="4" className="fill-white stroke-tinta" strokeWidth="3" />
      <circle cx="226" cy="64" r="3" className="fill-tinta" />
      <rect x="160" y="100" width="76" height="8" rx="4" className="fill-white stroke-tinta" strokeWidth="3" />
      <path
        d="M170 108H232Q232 124 218 128V138H190V128Q170 124 170 108Z"
        className="fill-white stroke-tinta"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <circle cx="246" cy="44" r="6" className="fill-white stroke-tinta" strokeWidth="3" />
      <path d="M246 50V100" {...garisTinta} strokeWidth="2" className="stroke-tinta" />
      <circle cx="246" cy="106" r="4" className="fill-tinta" />
      <circle cx="246" cy="126" r="6" className="fill-white stroke-tinta" strokeWidth="3" />
      <path d="M252 44H298" {...garisTinta} strokeWidth="2.500" strokeDasharray="3 5" className="stroke-tinta" />
      <path d="M300 58h20q-2-4-2-12a8 8 0 0 0-16 0q0 8-2 12z" className="fill-white stroke-tinta" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="310" cy="63" r="3" className="fill-tinta" />
      <path d="M328 36A8 8 0 0 1 328 52M334 30A16 16 0 0 1 334 58" {...garisTinta} strokeWidth="2.500" className="stroke-tinta" />
    </Kanvas>
  ),
};

/** Gambar yang memuat angka ukuran; di bawahnya tampil catatan bahwa angka hanya acuan umum. */
const BERANGKA = new Set(["bath-door:tanpa_biaya", "bath-door:alat_tanpa_bongkar", "bath-door:renovasi"]);

/** Ilustrasi selebar panel untuk satu pilihan solusi; null bila panduan itu belum punya ilustrasi. */
export function IlustrasiSolusi({ kartuId, tingkat }: { kartuId: string; tingkat: Tingkat }) {
  const kunci = `${kartuId}:${tingkat}`;
  const Gambar = GAMBAR[kunci];
  if (!Gambar) return null;
  return (
    <>
      <svg viewBox="0 0 360 150" className="block h-auto w-full" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid slice">
        <Gambar />
      </svg>
      {BERANGKA.has(kunci) && <p className="px-4 pt-2 text-mikro text-redup">{konten.ui.ilustrasi.catatanAngka}</p>}
    </>
  );
}
