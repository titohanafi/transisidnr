import type { ReactNode } from "react";
import { konten } from "../domain/content";

// Bahan gambar bergaya petunjuk perabot: garis tinta tegas, isian putih, tanpa warna. Dekoratif (aria-hidden di pembungkus).
// Pengguna kursi roda digambar aktif dan mandiri (prinsip 1: berdaya). Angka hanya dari content/ui.json (ilustrasi.angka).

export const garisTinta = { fill: "none", strokeLinecap: "round", strokeLinejoin: "round" } as const;

/** Anggota badan berkontur: garis tinta tebal dengan isian putih di dalamnya. */
function Anggota({ d, tebal }: { d: string; tebal: number }) {
  return (
    <>
      <path d={d} {...garisTinta} strokeWidth={tebal + 5} className="stroke-tinta" />
      <path d={d} {...garisTinta} strokeWidth={tebal} className="stroke-white" />
    </>
  );
}

const PANJANG_LENGAN = 31;

/** Siku dua ruas menuju titik `tangan`; tangan berhenti di jangkauan maksimum bila titiknya terlalu jauh. */
function lengan(bahu: [number, number], tangan: [number, number]): { siku: [number, number]; ujung: [number, number] } {
  const dx = tangan[0] - bahu[0];
  const dy = tangan[1] - bahu[1];
  const jarak = Math.hypot(dx, dy) || 1;
  const d = Math.min(jarak, PANJANG_LENGAN * 2 - 0.1);
  const [ux, uy] = [dx / jarak, dy / jarak];
  const h = Math.sqrt(PANJANG_LENGAN ** 2 - (d / 2) ** 2);
  return {
    siku: [bahu[0] + (ux * d) / 2 - uy * h, bahu[1] + (uy * d) / 2 + ux * h],
    ujung: [bahu[0] + ux * d, bahu[1] + uy * d],
  };
}

/** Pengguna kursi roda tampak samping, menghadap kanan. Titik (x, y) = tanah di bawah as roda besar. */
export function Pengguna({ x, y, tangan = [34, -80], skala = 1 }: { x: number; y: number; tangan?: [number, number]; skala?: number }) {
  const bahu: [number, number] = [-6, -94];
  const { siku, ujung } = lengan(bahu, tangan);
  return (
    <g transform={`translate(${x} ${y}) scale(${skala})`}>
      <circle cx="0" cy="-30" r="30" className="fill-white stroke-tinta" strokeWidth="3" />
      <circle cx="0" cy="-30" r="23" fill="none" strokeWidth="1.500" className="stroke-tinta" />
      <circle cx="0" cy="-30" r="3" className="fill-tinta" />
      <path d="M-20 -52L-26 -102L-37 -104" {...garisTinta} strokeWidth="3" className="stroke-tinta" />
      <path d="M-20 -52H30L46 -24H60" {...garisTinta} strokeWidth="3" className="stroke-tinta" />
      <path d="M34 -50L45 -18" {...garisTinta} strokeWidth="3" className="stroke-tinta" />
      <circle cx="46" cy="-8" r="8" className="fill-white stroke-tinta" strokeWidth="3" />
      <Anggota d="M-6 -66L-7 -96" tebal={14} />
      <Anggota d="M-6 -62H28" tebal={11} />
      <Anggota d="M28 -62L43 -30" tebal={9} />
      <Anggota d="M43 -28H58" tebal={6} />
      <circle cx="-6" cy="-114" r="11" className="fill-white stroke-tinta" strokeWidth="3" />
      <Anggota
        d={`M${bahu[0]} ${bahu[1]}L${siku[0].toFixed(1)} ${siku[1].toFixed(1)}L${ujung[0].toFixed(1)} ${ujung[1].toFixed(1)}`}
        tebal={6}
      />
    </g>
  );
}

/** Pendamping (caregiver) berdiri tegak tampak samping, menghadap kiri; tangan terbuka di depan, tidak menyentuh siapa pun. Titik (x, y) = tanah. */
export function Pendamping({ x, y, skala = 0.8 }: { x: number; y: number; skala?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${skala})`}>
      <Anggota d="M2 -90L4 -6" tebal={9} />
      <Anggota d="M-2 -90L-6 -6" tebal={9} />
      <Anggota d="M-6 -3H-18" tebal={6} />
      <Anggota d="M4 -3H-8" tebal={6} />
      <Anggota d="M0 -136L1 -88" tebal={17} />
      <circle cx="-1" cy="-152" r="11" className="fill-white stroke-tinta" strokeWidth="3" />
      <Anggota d="M4 -130L10 -104L8 -86" tebal={6} />
      <Anggota d="M-4 -130L-16 -110L-34 -104" tebal={6} />
    </g>
  );
}

/** Kursi roda tampak atas, menghadap ke atas layar. Titik (x, y) = pusat dudukan. */
export function KursiRodaAtas({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} className="stroke-tinta" strokeWidth="2.500">
      <rect x="-17" y="-9" width="6" height="22" rx="2.500" className="fill-white" />
      <rect x="11" y="-9" width="6" height="22" rx="2.500" className="fill-white" />
      <rect x="-9" y="-11" width="18" height="22" rx="4" className="fill-white" />
      <circle cx="0" cy="0" r="4.500" className="fill-white" />
      <path d="M-9 12H9" {...garisTinta} strokeWidth="4" />
      <rect x="-13" y="-19" width="5" height="7" rx="2" className="fill-white" />
      <rect x="8" y="-19" width="5" height="7" rx="2" className="fill-white" />
    </g>
  );
}

/** Kepala panah segitiga terisi di ujung (x, y) menunjuk ke arah `arah` (derajat; 0 = kanan, -90 = atas). */
export function Panah({ x, y, arah, kelas = "fill-tinta" }: { x: number; y: number; arah: number; kelas?: string }) {
  return <path d="M0 0L-9 -5V5z" transform={`translate(${x} ${y}) rotate(${arah})`} className={kelas} />;
}

const cap = {
  fontSize: 11,
  fontWeight: 700,
  textAnchor: "middle",
  fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
} as const;

/** Garis ukur mendatar dengan label angka di atasnya. */
export function UkurMendatar({ x1, x2, y, angka }: { x1: number; x2: number; y: number; angka: string }) {
  return (
    <g className="stroke-tinta" strokeWidth="1.500" {...garisTinta}>
      <path d={`M${x1} ${y}H${x2}M${x1} ${y - 4}v8M${x2} ${y - 4}v8`} />
      <text x={(x1 + x2) / 2} y={y - 6} stroke="none" className="fill-tinta" {...cap}>
        {angka}
      </text>
    </g>
  );
}

/** Garis ukur tegak dengan label angka di sisi kanannya. */
export function UkurTegak({ x, y1, y2, angka }: { x: number; y1: number; y2: number; angka: string }) {
  return (
    <g className="stroke-tinta" strokeWidth="1.500" {...garisTinta}>
      <path d={`M${x} ${y1}V${y2}M${x - 4} ${y1}h8M${x - 4} ${y2}h8`} />
      <text x={x + 8} y={(y1 + y2) / 2 + 4} stroke="none" className="fill-tinta" {...cap} textAnchor="start">
        {angka}
      </text>
    </g>
  );
}

/** Kloset tampak depan; `x` = sumbu tengah, tanah di y = 138. */
export function KlosetDepan({ x }: { x: number }) {
  return (
    <g transform={`translate(${x - 110} 0)`} className="stroke-tinta" strokeWidth="3" strokeLinejoin="round">
      <rect x="88" y="36" width="44" height="42" rx="4" className="fill-white" />
      <circle cx="110" cy="36" r="3.500" className="fill-tinta" stroke="none" />
      <rect x="76" y="84" width="68" height="8" rx="4" className="fill-white" />
      <path d="M80 92H140Q140 112 126 118V138H94V118Q80 112 80 92Z" className="fill-white" />
    </g>
  );
}

/** Tanda "jangan": lingkaran bergaris miring di atas benda yang tidak boleh dijadikan tumpuan. */
export function Larang({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} className="stroke-tinta" strokeWidth="3" {...garisTinta}>
      <circle r="13" className="fill-white" fillOpacity="0.85" />
      <path d="M-9 -9L9 9" />
    </g>
  );
}

/** Dinding tampak atas: batang hitam tebal. */
export const Dinding = ({ x1, x2, y }: { x1: number; x2: number; y: number }) => (
  <rect x={x1} y={y} width={x2 - x1} height="8" className="fill-tinta" />
);

export const Kanvas = ({ children }: { children: ReactNode }) => (
  <>
    <rect width="360" height="150" className="fill-white" />
    {children}
  </>
);

/** Teks angka dari content/ui.json (bukan dari komponen). */
export const angka = (kunci: string): string => konten.ui.ilustrasi.angka[kunci] ?? "";
