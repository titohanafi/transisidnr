import { z } from "zod";
import {
  AKTIVITAS,
  ALAT_BANTU,
  HUNIAN,
  JENIS_BANTUAN,
  KATEGORI_KONTAK,
  PERAN_LANGKAH,
  STATUS_VALIDASI,
  TINGKAT,
  TINGKAT_BIAYA,
  type Aktivitas,
  type Hunian,
  type Tingkat,
} from "./konstanta";

export { AKTIVITAS, TINGKAT, type Aktivitas, type Hunian, type Tingkat };

const teks = z.string().min(1);

const urlHttp = z
  .string()
  .url()
  .refine((u) => /^https?:\/\//i.test(u), { message: "hanya tautan http(s)" });

export const barangSchema = z.object({
  nama: teks,
  spesifikasi: teks,
  cek_kecocokan: teks,
  link: urlHttp.nullable(),
  kisaran_harga: z.string().nullable(),
  afiliasi: z.boolean(),
});

export const ukuranSchema = z.object({
  label: teks,
  nilai: teks,
  satuan: teks,
});

export const tingkatSolusiSchema = z
  .object({
    ringkasan: teks,
    langkah: z.array(teks).min(1),
    /** Peran tiap langkah, urutannya sama dengan `langkah` (panjang harus sama). */
    peran_langkah: z.array(z.enum(PERAN_LANGKAH)).optional(),
    sifat: z.enum(["sementara", "permanen"]),
    // `kisaran_rp` dibaca mesin rekomendasi (total dan anggaran). `estimasi_rp` hanya untuk tampilan: tidak memengaruhi rekomendasi.
    biaya: z.object({ kisaran_rp: z.string().nullable(), estimasi_rp: z.string().nullable().optional() }),
    usaha: z.object({ waktu: z.string().nullable(), kesulitan: z.string().nullable() }),
    ukuran: z.array(ukuranSchema).optional(),
    barang: z.array(barangSchema).default([]),
  })
  .refine((s) => !s.peran_langkah || s.peran_langkah.length === s.langkah.length, {
    message: "peran_langkah harus sebanyak langkah",
  });

export const solusiSchema = z
  .object({
    tanpa_biaya: tingkatSolusiSchema.optional(),
    alat_tanpa_bongkar: tingkatSolusiSchema.optional(),
    renovasi: tingkatSolusiSchema.optional(),
  })
  .refine((s) => TINGKAT.some((t) => s[t]), { message: "solusi minimal punya satu tingkat" });

export const bantuanSchema = z.object({
  jenis: z.enum(JENIS_BANTUAN),
  keterangan: teks,
});

export const tagSchema = z.object({
  fase: z.array(teks),
  ruangan: z.array(teks),
  aktivitas: z.array(z.enum(AKTIVITAS)),
  alat_bantu: z.array(z.enum(ALAT_BANTU)),
  hunian: z.array(z.enum(HUNIAN)),
  tingkat_biaya: z.array(z.enum(TINGKAT_BIAYA)),
  kondisi: z.array(teks),
  // Penanda kartu pendamping caregiver (lihat DECISIONS.md).
  peran: z.array(z.enum(["caregiver", "penyandang_disabilitas"])).optional(),
});

export const kartuSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    judul: teks,
    situasi: teks,
    kenapa_penting: teks.optional(),
    solusi: solusiSchema.optional(),
    bantuan: z.array(bantuanSchema).optional(),
    peran: z.object({ penyandang_disabilitas: teks, caregiver: teks }).optional(),
    peringatan: teks.optional(),
    sumber: z.array(z.object({ judul: teks, url: urlHttp.optional() })).optional(),
    tag: tagSchema,
    status_validasi: z.enum(STATUS_VALIDASI),
    isi_menyusul: z.boolean().optional(),
  })
  .superRefine((k, ctx) => {
    if (!k.isi_menyusul) {
      for (const f of ["kenapa_penting", "solusi", "bantuan", "peran", "sumber"] as const) {
        if (k[f] === undefined) {
          ctx.addIssue({ code: "custom", path: [f], message: `${f} wajib bila isi_menyusul bukan true` });
        }
      }
    }
  });

const nomorKontak = z
  .string()
  .regex(/^\+?\d[\d\s-]{1,18}$/, { message: "nomor telepon tidak valid" })
  .nullable();

export const kontakSchema = z
  .object({
    kategori: z.array(z.object({ id: z.enum(KATEGORI_KONTAK), nama: teks, arti: teks })).min(1),
    entri: z.array(
      z.object({
        id: z.string().regex(/^[a-z0-9-]+$/),
        kategori: z.enum(KATEGORI_KONTAK),
        nama: teks,
        telepon: nomorKontak,
        whatsapp: nomorKontak,
        kota: z.string().nullable(),
        alamat: z.string().nullable(),
        catatan: z.string().nullable(),
        /** Alamat halaman resmi tempat data ini diambil, supaya bisa diperiksa. */
        sumber: urlHttp.nullable(),
        status_validasi: z.enum(STATUS_VALIDASI),
      }),
    ),
  })
  .refine((k) => k.entri.every((e) => k.kategori.some((c) => c.id === e.kategori)), { message: "entri menunjuk kategori yang tidak ada" })
  .refine((k) => new Set(k.entri.map((e) => e.id)).size === k.entri.length, { message: "id entri kontak ganda" });

export const asesmenSchema = z.object({
  aktivitas: z.array(z.object({ id: z.enum(AKTIVITAS), label: teks, bisaDipilihPrioritas: z.boolean() })).min(1),
  pertanyaan: z
    .array(
      z.object({
        id: teks,
        aktivitas: z.enum(AKTIVITAS),
        pertanyaan: teks,
        penjelasan: teks,
        memicu_kartu: z.array(teks).min(1),
      }),
    )
    .min(1),
});

export const configSchema = z.object({
  ruangan: z.array(z.object({ id: teks, nama: teks, tersedia: z.boolean() })).min(1),
  faseAwalBulan: z.number().int().positive(),
  maksMulaiDariSini: z.number().int().positive(),
  budget: z.array(
    z.object({
      id: teks,
      label: teks,
      minRp: z.number().nullable(),
      maksRp: z.number().nullable(),
    }),
  ),
});

const opsi = z.object({ id: teks, label: teks });

export const onboardingSchema = z.object({
  pertanyaan: z.array(
    z
      .object({
        id: teks,
        pertanyaan: teks,
        bantuan: teks.optional(),
        banyakPilihan: z.boolean(),
        // Salah satu: daftar `pilihan` tertulis di sini, atau `pilihanDari` (daftar dibaca dari config.json).
        pilihan: z
          .array(opsi.extend({ bulanMaks: z.number().nullable().optional(), respons: teks.optional() }))
          .min(2)
          .optional(),
        pilihanDari: z.enum(["budget"]).optional(),
      })
      .refine((q) => (q.pilihan === undefined) !== (q.pilihanDari === undefined), {
        message: "isi tepat satu dari `pilihan` atau `pilihanDari`",
      }),
  ),
});

const rekamTeks = z.record(z.string(), teks);

// Teks antarmuka. Bagian baru ditambahkan di sini bersama content/ui.json.
export const uiSchema = z
  .object({
    app: z.object({ nama: teks }),
    beranda: z.object({
      spandukDraf: teks,
      sapaan: z.object({ pagi: teks, siang: teks, sore: teks, malam: teks }),
      pilih: z.object({
        judul: teks,
        susun: z.object({ judul: teks, deskripsi: teks, tombol: teks }),
        lanjut: z.object({ judul: teks, deskripsi: teks, tombol: teks }),
        cakupan: teks,
        tutupCakupan: teks,
        cari: z.object({ label: teks, tombol: teks, saranJudul: teks, saran: z.array(teks).min(1) }),
      }),
    }),
    umum: rekamTeks,
    kontak: z.object({
      judul: teks,
      pengantar: teks,
      sumber: teks,
      keteranganSumber: teks,
      filterSemua: teks,
      filterJudul: teks,
      telepon: teks,
      whatsapp: teks,
      kosong: teks,
      panduanTerkait: teks,
      untukPanduan: teks,
      saranUntukPanduan: teks,
    }),
    igd: z.object({ judul: teks, isi: teks, daftarJudul: teks, tandaBahaya: z.array(teks), menyusul: teks }),
    saya: z.object({
      judul: teks,
      pengantar: teks,
      jawabanJudul: teks,
      belumJawab: teks,
      mulai: teks,
      ruangan: teks,
      aktivitas: teks,
      prioritas: teks,
      belumDipilih: teks,
      ubah: teks,
      riwayatJudul: teks,
      riwayatKosong: teks,
      dataIsi: teks,
    }),
    hapusData: z.object({
      judul: teks,
      penjelasan: teks,
      tombol: teks,
      selesai: teks,
      konfirmasi: teks,
      ya: teks,
      batal: teks,
    }),
    onboarding: z.object({ judul: teks, indikator: teks, cakupan: teks, lanjutTerakhir: teks }),
    asesmen: z.object({
      ruangan: teks,
      ubahRuangan: teks,
      judul: teks,
      aktivitas: z.object({
        judul: teks,
        bantuan: teks,
        tidakRelevan: teks,
        minimal: teks,
        status: z.object({ bisa_sendiri: teks, sulit: teks, ingin_belum_bisa: teks }),
      }),
      prioritas: z.object({ judul: teks, bantuan: teks, maksimal: teks }),
      pertanyaan: z.object({ indikator: teks, ya: teks, tidak: teks, penjelasanJudul: teks }),
      foto: z.object({
        judul: teks,
        penjelasan: teks,
        pilih: teks,
        ganti: teks,
        hapus: teks,
        alt: teks,
        gagalSimpan: teks,
        gagalBaca: teks,
        selesai: teks,
        lewati: teks,
      }),
    }),
    rencana: z.object({
      judul: teks,
      prioritas: teks,
      ubahJawaban: teks,
      semuaPanduan: teks,
      satuHal: teks,
      dariKartu: teks,
      lihatKartu: teks,
      mulaiDariSini: teks,
      semuaRekomendasi: teks,
      kosongJudul: teks,
      kosongIsi: teks,
      belumJelas: teks,
      total: teks,
      pendampingJudul: teks,
      bukaKartu: teks,
      cocokSewa: teks,
      cetak: teks,
      sedangDisusun: teks,
      belumAdaSiap: teks,
      ringan: z.object({ catatan: teks, lihatNanti: teks }),
      kemajuan: teks,
      beres: z.object({ judul: teks, ringkasan: teks, kosong: teks, lihat: teks }),
      perluLagi: teks,
    }),
    kartu: z.object({
      tingkat: z.object({ tanpa_biaya: teks, alat_tanpa_bongkar: teks, renovasi: teks }),
      tidakDitemukan: teks,
      jembatanPasang: teks,
      kembaliKeRencana: teks,
      kembaliKeJelajah: teks,
      situasi: teks,
      kenapa: teks,
      solusi: teks,
      langkah: teks,
      biaya: teks,
      waktu: teks,
      kesulitan: teks,
      ukuran: teks,
      ukuranMenyusul: teks,
      barang: teks,
      spesifikasi: teks,
      cek: teks,
      harga: teks,
      afiliasi: teks,
      tingkatDisembunyikan: teks,
      bantuan: teks,
      peranPenyandang: teks,
      peranCaregiver: teks,
      peranLangkah: z.object({ penyandang_disabilitas: teks, caregiver: teks, bersama: teks, tukang: teks }),
      peringatan: teks,
      sumber: teks,
      sumberMenyusul: teks,
      istilah: teks,
      direktoriMenyusul: teks,
      jenisBantuan: z.record(z.enum(JENIS_BANTUAN), z.object({ nama: teks, arti: teks })),
    }),
    aksi: z.object({
      tombol: z.object({ sendiri: teks, beli: teks, tukang: teks, ahli: teks }),
      kembaliKeKartu: teks,
      sendiri: z.object({
        judul: teks,
        bantuan: teks,
        progres: teks,
        selesai: teks,
        dorongan: z.object({ mulai: teks, separuh: teks }),
        hasil: z.object({
          judul: teks,
          cukup: teks,
          sulit: teks,
          balasCukup: teks,
          balasSulit: teks,
          berikutnya: teks,
          terakhir: teks,
        }),
      }),
      beli: z.object({
        label: teks,
        lihatProduk: teks,
        linkMenyusul: teks,
        afiliasi: teks,
        afiliasiPenjelasan: teks,
        kosong: teks,
      }),
      tukang: z.object({
        judul: teks,
        bantuan: teks,
        ikutkan: teks,
        ubahTeks: teks,
        pratinjau: teks,
        kirimWa: teks,
        salin: teks,
        tersalin: teks,
        gagalSalin: teks,
        kosong: teks,
        waCatatan: teks,
      }),
      brief: z.object({
        alatKhusus: teks,
        sapaan: teks,
        ruangan: teks,
        masalah: teks,
        modifikasi: teks,
        hunian: teks,
        izinPemilik: teks,
        budget: teks,
        budgetBelumTahu: teks,
        fotoTerpisah: teks,
      }),
      ahli: z.object({ judul: teks, bantuan: teks, nyeri: teks, kosong: teks }),
      cetak: z.object({
        judulKertas: teks,
        langkahSelesai: teks,
        langkahBelum: teks,
        tombol: teks,
        penjelasan: teks,
        foto: teks,
        satuHal: teks,
        kosong: teks,
      }),
    }),
    jelajah: z.object({
      judul: teks,
      pengantar: teks,
      status: z.object({ cukup: teks, masih_sulit: teks }),
      kosongFilter: teks,
      caregiver: teks,
      aksiKartu: teks,
      semuaPanduan: teks,
      cari: z.object({
        label: teks,
        contoh: z.array(teks).min(1),
        tombol: teks,
        hapus: teks,
        kosong: teks,
        cakupan: teks,
      }),
      lainnya: z.object({ judul: teks, alat: teks, ahli: teks }),
      judulFilter: z.object({ semua: teks, alat: teks, ahli: teks }),
      pengantarFilter: z.object({ semua: teks, alat: teks, ahli: teks }),
      alat: z.object({ dipakaiDi: teks, kosong: teks, detailMenyusul: teks }),
      ahli: z.object({ membantuDi: teks, kosong: teks }),
    }),
    istilah: z.array(z.object({ kata: teks, arti: teks })),
    pilihRuangan: z.object({ judul: teks, segera: teks, lanjut: teks }),
    checkin: z.object({
      label: teks,
      hariIni: teks,
      belumDiisi: teks,
      artiIkon: teks,
      ubah: teks,
      pertanyaan: teks,
      pilihan: z
        .array(
          opsi.extend({
            emoji: teks,
            singkat: teks,
            balasan: teks,
            bantuan: z.object({ tombol: teks, ke: teks.regex(/^\//).optional(), panduan: teks.optional() }),
          }),
        )
        .min(1),
      penutup: teks,
    }),
  })
  .strict();

export type Kartu = z.infer<typeof kartuSchema>;
export type TingkatSolusi = z.infer<typeof tingkatSolusiSchema>;
export type Barang = z.infer<typeof barangSchema>;
export type Kontak = z.infer<typeof kontakSchema>;
export type Asesmen = z.infer<typeof asesmenSchema>;
export type Pertanyaan = Asesmen["pertanyaan"][number];
export type Config = z.infer<typeof configSchema>;
export type Onboarding = z.infer<typeof onboardingSchema>;
export type Ui = z.infer<typeof uiSchema>;
export type Brief = Ui["aksi"]["brief"];
