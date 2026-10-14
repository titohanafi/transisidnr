import { KATEGORI_KONTAK, type KategoriKontak } from "./konstanta";
import type { Kartu, Kontak } from "./schema";

export type KategoriInfo = Kontak["kategori"][number];
export type EntriKontak = Kontak["entri"][number];

export interface KelompokKontak {
  kategori: KategoriInfo;
  entri: EntriKontak[];
}

/** Kategori yang disarankan sebuah panduan (dari bidang `bantuan`), dalam urutan tampil kategori. */
export function kategoriUntukKartu(kartu: Pick<Kartu, "bantuan">): KategoriKontak[] {
  const jenis = new Set<string>((kartu.bantuan ?? []).map((b) => b.jenis));
  return KATEGORI_KONTAK.filter((k) => jenis.has(k));
}

/**
 * Mengelompokkan kontak per kategori. Urutan: kategori yang diminta lebih dulu (mis. yang disarankan sebuah panduan),
 * lalu sisanya menurut KATEGORI_KONTAK. Kategori tanpa entri tetap ada (untuk menampilkan "menyusul").
 * Urutan entri dalam kategori mengikuti berkas; tidak ada pengaruh pembayaran.
 */
export function kelompokkanKontak(kontak: Kontak, utamakan: readonly KategoriKontak[] = []): KelompokKontak[] {
  const urut = [...utamakan, ...KATEGORI_KONTAK.filter((k) => !utamakan.includes(k))];
  return urut
    .map((id) => kontak.kategori.find((c) => c.id === id))
    .filter((c): c is KategoriInfo => c !== undefined)
    .map((kategori) => ({ kategori, entri: kontak.entri.filter((e) => e.kategori === kategori.id) }));
}

/** Hanya angka (dan + di depan) supaya aman dipakai di tautan tel: dan wa.me. */
export const nomorBersih = (nomor: string): string => nomor.replace(/[^\d+]/g, "");

export const urlTelepon = (nomor: string): string => `tel:${nomorBersih(nomor)}`;

/** wa.me memerlukan angka saja, tanpa tanda + di depan. */
export const urlWhatsAppKontak = (nomor: string): string => `https://wa.me/${nomorBersih(nomor).replace(/^\+/, "")}`;
