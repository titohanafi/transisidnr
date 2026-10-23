// Membuat ulang gambar di papan acuan Claude Design dari fungsi gambar yang sama dengan aplikasi
// (`src/domain/gambarShower.ts` dan `gambarBenda.ts`), supaya papan dan aplikasi tidak pernah berbeda ukuran.
//
// Pemakaian: npx tsx scripts/ekspor-papan.ts <folder papan>
// Folder berisi Main.dc.html (varian shower), M07.dc.html (hand shower tiga langkah), dan Benda.dc.html (kloset, wastafel,
// pintu). Hanya isi tiap <svg> yang diganti; judul, teks, dan tata letak papan dibiarkan.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { bingkaiBenda, susunBenda, type JenisBenda } from "../src/domain/gambarBenda";
import { LEBAR_KANVAS, susunGambar, TINGGI_KANVAS, type ModeGambar, type Primitif, type Titik } from "../src/domain/gambarShower";
import type { VarianShower } from "../src/domain/pindai";

// Tebal garis dasar pada kanvas selebar `LEBAR_KANVAS`; gambar yang dibingkai lebih sempit memakai tebal sebanding
// lebar bingkainya supaya garis tampak sama tebal relatif terhadap benda (seperti papan sebelumnya).
const GARIS_DASAR = 2.2;
const TINTA = "#111";
const AKSEN = "#0F7B63";
const KONTROL = "#6B7580";
const f = (v: number) => (Math.round(v * 100) / 100).toString();
const pts = (t: readonly Titik[]) => t.map((p) => `${f(p[0])},${f(p[1])}`).join(" ");

const ISI: Record<string, Record<string, string>> = {
  netral: { atas: "#fff", kanan: "#e6e6e6", kiri: "#d6d6d6", latar: "#fff", pita: "#d6d6d6", rongga: "#d6d6d6", zona: "none" },
  aksen: { atas: "#bfe6db", kanan: "#8fcfbf", kiri: "#7cc2b0", latar: "#fff", pita: "#7cc2b0", rongga: "#7cc2b0", zona: AKSEN },
  hantu: { atas: "none", kanan: "none", kiri: "none", latar: "none", pita: "none", rongga: "none", zona: "none" },
};
const garis = (peran: string) => (peran === "aksen" ? AKSEN : peran === "hantu" ? KONTROL : TINTA);

function bentuk(s: Primitif, penanda: string, m: number): string {
  const w = GARIS_DASAR * m;
  switch (s.jenis) {
    case "poligon": {
      if (s.tepi) return `<polygon points="${pts(s.titik)}" fill="${TINTA}" stroke="${TINTA}" stroke-width="${f(2 * w)}"/>`;
      if (s.muka === "zona")
        return `<polygon points="${pts(s.titik)}" fill="${AKSEN}" fill-opacity="0.1" stroke="${AKSEN}" stroke-width="${f(2.4 * m)}" stroke-dasharray="${f(9 * m)} ${f(6 * m)}"/>`;
      const hantu = s.peran === "hantu";
      const tanpa = s.muka === "pita" || s.tanpaGaris;
      const lebar = hantu ? f(1.8 * m) : s.garisTipis ? f(0.45 * w) : null;
      return `<polygon points="${pts(s.titik)}" fill="${ISI[s.peran][s.muka]}"${tanpa ? ' stroke="none"' : ` stroke="${garis(s.peran)}"`}${hantu ? ` stroke-dasharray="${f(5 * m)} ${f(4 * m)}"` : ""}${lebar ? ` stroke-width="${lebar}"` : ""}/>`;
    }
    case "garisPoli":
      return `<polyline points="${pts(s.titik)}" fill="none" stroke="${garis(s.peran)}"${s.putus || s.peran === "hantu" ? ` stroke-dasharray="${f(5 * m)} ${f(4 * m)}"` : ""}${s.peran === "hantu" ? ' stroke-width="1.8"' : ""}/>`;
    case "elips": {
      const isi = s.tingkat === "atas" ? ISI[s.peran].atas : s.tingkat === "rongga" ? ISI[s.peran].rongga : "none";
      const lebar = s.tingkat === "tutup" ? 1.2 * m : s.tingkat === "rongga" ? 1.4 * m : w;
      return `<ellipse cx="${f(s.cx)}" cy="${f(s.cy)}" rx="${f(s.rx)}" ry="${f(s.ry)}" fill="${isi}" stroke="${garis(s.peran)}" stroke-width="${f(lebar)}"/>`;
    }
    case "badan": {
      const isi = s.peran === "aksen" ? (s.muka === "kanan" ? "#8fcfbf" : "#7cc2b0") : s.muka === "kanan" ? "#e6e6e6" : "#d6d6d6";
      return `<path d="M${f(s.cx - s.rx)},${f(s.yAtas)} L${f(s.cx - s.rx)},${f(s.yBawah)} A${f(s.rx)} ${f(s.ry)} 0 0 0 ${f(s.cx + s.rx)},${f(s.yBawah)} L${f(s.cx + s.rx)},${f(s.yAtas)} Z" fill="${isi}" stroke="${garis(s.peran)}"/>`;
    }
    case "cakram": {
      const muka = s.tingkat !== "belakang";
      const lubang = s.tingkat === "depan";
      const isi = muka ? ISI[s.peran].atas : "#d6d6d6";
      const titikLubang: [number, number][] = [
        [0, 0],
        [8, 0],
        [-8, 0],
        [0, 8],
        [0, -8],
        [5.7, 5.7],
        [-5.7, 5.7],
        [5.7, -5.7],
        [-5.7, -5.7],
      ];
      const rl = s.r / 22;
      return (
        `<g transform="matrix(${f(s.sumbuA[0])} ${f(s.sumbuA[1])} ${f(s.sumbuU[0])} ${f(s.sumbuU[1])} ${f(s.cx)} ${f(s.cy)})" stroke="${garis(s.peran)}">` +
        `<circle r="${f(s.r)}" fill="${isi}" vector-effect="non-scaling-stroke"/>` +
        (lubang
          ? `<circle r="${f(s.r * 0.68)}" fill="none" stroke-width="${f(1.2 * m)}" vector-effect="non-scaling-stroke"/><g fill="${s.peran === "aksen" ? AKSEN : TINTA}" stroke="none">` +
            titikLubang.map(([x, y]) => `<circle cx="${f(x * rl)}" cy="${f(y * rl)}" r="${f(1.6 * rl)}"/>`).join("") +
            "</g>"
          : "") +
        "</g>"
      );
    }
    case "garis": {
      const [x1, y1] = s.dari;
      const [x2, y2] = s.ke;
      const c = `x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}"`;
      if (s.gaya === "ubin") return `<line ${c} stroke="#6B7580" stroke-opacity="0.35" stroke-width="${f(0.45 * w)}"/>`;
      if (s.gaya === "air") return `<line ${c} stroke="${KONTROL}" stroke-width="${f(2 * m)}" stroke-dasharray="${f(4 * m)} ${f(5 * m)}"/>`;
      if (s.gaya === "silang") return `<line ${c} stroke="${garis(s.peran)}" stroke-width="${f(5 * m)}"/>`;
      if (s.gaya === "panah")
        return `<line ${c} stroke="${garis(s.peran)}" stroke-width="${f(3.5 * m)}" stroke-dasharray="${f(7 * m)} ${f(5 * m)}" marker-end="url(#${penanda})"/>`;
      return `<line ${c} stroke="${garis(s.peran)}"${s.gaya === "putus" ? ' stroke-dasharray="6 5"' : ""}/>`;
    }
    case "jalur": {
      let d = `M${f(s.titik[0][0])},${f(s.titik[0][1])}`;
      if (s.titik.length === 2) d += ` L${f(s.titik[1][0])},${f(s.titik[1][1])}`;
      else for (let i = 1; i + 2 < s.titik.length; i += 3) d += ` C${pts([s.titik[i]])} ${pts([s.titik[i + 1]])} ${pts([s.titik[i + 2]])}`;
      if (s.gaya === "lengkung") return `<path d="${d}" fill="none" stroke="${garis(s.peran)}" stroke-width="${f(1.8 * m)}"/>`;
      const dalam = s.gaya === "selang" ? KONTROL : "#ECECEA";
      return `<path d="${d}" fill="none" stroke="${TINTA}" stroke-width="${f((s.gaya === "selang" ? 8.5 : 7) * m)}"/><path d="${d}" fill="none" stroke="${dalam}" stroke-width="${f((s.gaya === "selang" ? 4.5 : 3) * m)}"/>`;
    }
    case "baut":
      return `<circle cx="${f(s.cx)}" cy="${f(s.cy)}" r="${f(1.8 * m)}" fill="${s.peran === "aksen" ? AKSEN : TINTA}" stroke="none"/>`;
    case "tanda":
      return `<text x="${f(s.x)}" y="${f(s.y)}" text-anchor="middle" font-size="30" font-weight="800" fill="#5C6670" stroke="none">${s.teks}</text>`;
  }
}

function isiSvg(daftar: Primitif[], penanda: string, m: number): string {
  const baris = daftar.map((s) => `          ${bentuk(s, penanda, m)}`).join("\n");
  return (
    `\n        <defs><marker id="${penanda}" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="${TINTA}"/></marker></defs>\n` +
    `        <g stroke-width="${f(GARIS_DASAR * m)}" stroke-linejoin="round" stroke-linecap="round">\n${baris}\n        </g>\n      `
  );
}

/** Ganti isi tiap <svg> ke-i pada berkas dengan gambar baru; `viewBox` baru (bila ada) menggantikan yang lama. */
function gantiSvg(berkas: string, gambar: { daftar: Primitif[]; viewBox?: string }[]): void {
  const teks = readFileSync(berkas, "utf8");
  let i = 0;
  const hasil = teks.replace(/<svg viewBox="([^"]*)"([^>]*)>[\s\S]*?<\/svg>/g, (_semua, vb: string, sisa: string) => {
    const g = gambar[i];
    if (!g) throw new Error(`${berkas}: svg ke-${i + 1} tidak punya gambar pengganti`);
    i++;
    const viewBox = g.viewBox ?? vb;
    const lebarVB = Number(viewBox.split(" ")[2]);
    return `<svg viewBox="${viewBox}"${sisa}>${isiSvg(g.daftar, `ujung${i}`, lebarVB / LEBAR_KANVAS)}</svg>`;
  });
  if (i !== gambar.length) throw new Error(`${berkas}: ada ${i} svg, tetapi ${gambar.length} gambar pengganti`);
  writeFileSync(berkas, hasil);
  console.log(`${berkas}: ${i} gambar diperbarui`);
}

const folder = process.argv[2];
if (!folder) {
  console.error("Pemakaian: npx tsx scripts/ekspor-papan.ts <folder papan>");
  process.exit(1);
}
const kanvas = `0 0 ${LEBAR_KANVAS} ${TINGGI_KANVAS}`;
const varian: VarianShower[] = ["hand_shower_gantung", "shower_tetap", "ember_gayung", "tidak_jelas"];
gantiSvg(
  join(folder, "Main.dc.html"),
  varian.map((v) => ({ daftar: susunGambar(v, "kondisi", "kanan"), viewBox: kanvas })),
);
const langkah: ModeGambar[] = ["kondisi", "hack", "permanen"];
gantiSvg(
  join(folder, "M07.dc.html"),
  langkah.map((m) => ({ daftar: susunGambar("hand_shower_gantung", m, "kanan", { anotasi: true }), viewBox: kanvas })),
);
const benda: JenisBenda[] = ["kloset_duduk", "kloset_jongkok", "wastafel", "pintu"];
gantiSvg(
  join(folder, "Benda.dc.html"),
  benda.map((j) => ({ daftar: susunBenda(j, "kanan"), viewBox: bingkaiBenda(j, "kanan").map(f).join(" ") })),
);
