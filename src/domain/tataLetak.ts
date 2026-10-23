// Tata letak benda sepanjang dinding dalam cm, supaya benda di satu dinding tidak berdempetan atau menembus tepi dinding.
// Posisi awal (dari persen kasar hasil pindai) dipertahankan sedekat mungkin; hanya digeser bila terlalu dekat.

export interface BendaDinding {
  id: string;
  /** Posisi awal tengah benda sepanjang dinding (cm dari tengah dinding). */
  awal: number;
  /** Setengah lebar benda sepanjang dinding (cm). */
  setengah: number;
}

/** Jarak bebas minimum antar benda di satu dinding (cm, dari tepi ke tepi). */
export const JARAK_BEBAS_BENDA = 25;
/** Jarak minimum tepi benda ke sudut dinding (cm). */
export const JARAK_TEPI_DINDING = 6;

/**
 * Fungsi murni: posisi tengah tiap benda di satu dinding sepanjang `panjang` cm. Benda diurutkan menurut posisi awalnya,
 * pasangan yang berdekatan didorong menjauh sama besar sampai berjarak `JARAK_BEBAS_BENDA`, lalu semuanya dijepit ke
 * dalam dinding. Bila dinding tidak cukup untuk semuanya, jarak dikorbankan lebih dulu daripada menembus dinding.
 */
export function susunSepanjangDinding(benda: BendaDinding[], panjang: number): Record<string, number> {
  const urut = [...benda].sort((a, b) => a.awal - b.awal);
  const pos = urut.map((b) => b.awal);
  const batas = (i: number): [number, number] => [
    -panjang / 2 + urut[i].setengah + JARAK_TEPI_DINDING,
    panjang / 2 - urut[i].setengah - JARAK_TEPI_DINDING,
  ];
  for (let lewat = 0; lewat < 12; lewat++) {
    for (let i = 1; i < urut.length; i++) {
      const perlu = urut[i - 1].setengah + urut[i].setengah + JARAK_BEBAS_BENDA;
      const kurang = perlu - (pos[i] - pos[i - 1]);
      if (kurang > 1e-9) {
        pos[i] += kurang / 2;
        pos[i - 1] -= kurang / 2;
      }
    }
    for (let i = 0; i < urut.length; i++) pos[i] = Math.min(Math.max(pos[i], batas(i)[0]), batas(i)[1]);
  }
  return Object.fromEntries(urut.map((b, i) => [b.id, pos[i]]));
}
