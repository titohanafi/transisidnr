import type { ReactNode } from "react";
import { konten } from "../domain/content";
import type { Tingkat } from "../domain/konstanta";
import { Dinding, KursiRodaAtas, Kanvas, Panah, Pengguna, UkurMendatar, UkurTegak, angka, garisTinta } from "./GambarTeknis";

// Ilustrasi selebar panel untuk pilihan solusi. Dibuat bertahap, satu panduan demi satu panduan: panduan yang belum ada di
// daftar ini tidak menampilkan apa pun (kunci "idKartu:tingkat"). Gaya: petunjuk perabot hitam-putih (garis tinta tegas,
// isian putih, panah dan garis ukur), bahan gambarnya di GambarTeknis.tsx. Dekoratif; pengguna kursi roda digambar aktif.
// Angka hanya dari content/ui.json dan gambar berangka masuk daftar BERANGKA (ada catatan acuan umum di bawahnya).

const Bintik = ({ x, y, kolom, baris, jarak = 10 }: { x: number; y: number; kolom: number; baris: number; jarak?: number }) => (
  <g className="fill-tinta">
    {Array.from({ length: kolom * baris }, (_, i) => (
      <circle key={i} cx={x + (i % kolom) * jarak} cy={y + Math.floor(i / kolom) * jarak} r="1.800" />
    ))}
  </g>
);

const GAMBAR: Record<string, () => ReactNode> = {
  // Jaga lantai tetap kering dan bebas benda: ember dan botol dipindah ke rak, jalur kursi roda lapang.
  "bath-floor-slip:tanpa_biaya": () => (
    <Kanvas>
      <path d="M0 138H360" {...garisTinta} strokeWidth="3" className="stroke-tinta" />
      <rect x="330" y="0" width="12" height="138" className="fill-tinta" />
      <path d="M258 62H330M330 96L300 62" {...garisTinta} strokeWidth="4" className="stroke-tinta" />
      <path d="M268 36h26l-4 26h-18z" className="fill-white stroke-tinta" strokeWidth="3" strokeLinejoin="round" />
      <path d="M271 36q10-14 20 0" {...garisTinta} strokeWidth="2.500" className="stroke-tinta" />
      <rect x="304" y="44" width="14" height="18" rx="3" className="fill-white stroke-tinta" strokeWidth="3" />
      <rect x="308" y="36" width="6" height="8" className="fill-white stroke-tinta" strokeWidth="3" />
      <Pengguna x={96} y={138} tangan={[16, -56]} />
      <path d="M166 112H224" {...garisTinta} strokeWidth="3" strokeDasharray="3 7" className="stroke-tinta" />
      <Panah x={236} y={112} arah={0} />
      <path
        d="M178 120l2.500 6 6 2.500-6 2.500-2.500 6-2.500-6-6-2.500 6-2.500zM216 124l2 4.500 4.500 2-4.500 2-2 4.500-2-4.500-4.500-2 4.500-2z"
        className="fill-tinta"
      />
    </Kanvas>
  ),
  // Pasang keset atau stiker anti-slip di area berpindah (samping kloset) dan area mandi, tampak dari atas.
  "bath-floor-slip:alat_tanpa_bongkar": () => (
    <Kanvas>
      <rect x="24" y="8" width="312" height="134" fill="none" strokeWidth="6" className="stroke-tinta" />
      <rect x="44" y="16" width="34" height="12" rx="3" className="fill-white stroke-tinta" strokeWidth="3" />
      <ellipse cx="61" cy="46" rx="15" ry="18" className="fill-white stroke-tinta" strokeWidth="3" />
      <ellipse cx="61" cy="48" rx="8" ry="10" fill="none" strokeWidth="2" className="stroke-tinta" />
      <rect x="94" y="20" width="64" height="50" rx="4" className="fill-white stroke-tinta" strokeWidth="3" />
      <Bintik x={106} y={32} kolom={6} baris={4} jarak={9} />
      <rect
        x="226"
        y="18"
        width="100"
        height="116"
        rx="4"
        fill="none"
        strokeWidth="2"
        strokeDasharray="5 5"
        className="stroke-tinta"
        opacity="0.6"
      />
      <circle cx="276" cy="28" r="5" className="fill-tinta" />
      <path d="M268 36l-3 7M276 36v8M284 36l3 7" {...garisTinta} strokeWidth="2" className="stroke-tinta" />
      <rect x="240" y="54" width="72" height="70" rx="4" className="fill-white stroke-tinta" strokeWidth="3" />
      <Bintik x={252} y={66} kolom={6} baris={6} jarak={10} />
      <KursiRodaAtas x={126} y={108} />
      <path d="M126 90V80" {...garisTinta} strokeWidth="2.500" className="stroke-tinta" />
      <Panah x={126} y={78} arah={-90} />
    </Kanvas>
  ),
  // Ganti lantai dengan permukaan anti-slip, kemiringan ke saluran, tanpa beda tinggi: potongan lantai dari samping.
  "bath-floor-slip:renovasi": () => (
    <Kanvas>
      <path d="M0 146V108L172 116H188L360 108V146Z" className="fill-white stroke-tinta" strokeWidth="3" strokeLinejoin="round" />
      <g className="fill-tinta">
        {Array.from({ length: 12 }, (_, i) => (
          <circle key={`k${i}`} cx={10 + i * 14} cy={116 + (10 + i * 14) * 0.046} r="1.500" />
        ))}
        {Array.from({ length: 12 }, (_, i) => (
          <circle key={`r${i}`} cx={350 - i * 14} cy={116 + (10 + i * 14) * 0.046} r="1.500" />
        ))}
      </g>
      <rect x="170" y="114" width="20" height="9" rx="2" className="fill-white stroke-tinta" strokeWidth="3" />
      <path d="M176 114v9M180 114v9M184 114v9" {...garisTinta} strokeWidth="1.500" className="stroke-tinta" />
      <path d="M124 104L160 109M236 104L200 109" {...garisTinta} strokeWidth="2.500" strokeDasharray="3 6" className="stroke-tinta" />
      <Panah x={168} y={110} arah={8} />
      <Panah x={192} y={110} arah={172} />
      <Pengguna x={64} y={111} skala={0.62} tangan={[16, -56]} />
    </Kanvas>
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
