import { z } from "zod";

export const TINGKAT = ["tanpa_biaya", "alat_tanpa_bongkar", "renovasi"] as const;
export type Tingkat = (typeof TINGKAT)[number];

export const STATUS_VALIDASI = ["draf", "ditinjau_ahli", "disetujui"] as const;

const teks = z.string().min(1);

export const barangSchema = z.object({
  nama: teks,
  spesifikasi: teks,
  cek_kecocokan: teks,
  link: z.string().url().nullable(),
  kisaran_harga: z.string().nullable(),
  afiliasi: z.boolean(),
});

export const ukuranSchema = z.object({
  label: teks,
  nilai: teks,
  satuan: teks,
});

export const tingkatSolusiSchema = z.object({
  ringkasan: teks,
  langkah: z.array(teks).min(1),
  sifat: z.enum(["sementara", "permanen"]),
  biaya: z.object({ kisaran_rp: z.string().nullable() }),
  usaha: z.object({ waktu: z.string().nullable(), kesulitan: z.string().nullable() }),
  ukuran: z.array(ukuranSchema).optional(),
  barang: z.array(barangSchema).default([]),
});

export const solusiSchema = z
  .object({
    tanpa_biaya: tingkatSolusiSchema.optional(),
    alat_tanpa_bongkar: tingkatSolusiSchema.optional(),
    renovasi: tingkatSolusiSchema.optional(),
  })
  .refine((s) => TINGKAT.some((t) => s[t]), { message: "solusi minimal punya satu tingkat" });

export const JENIS_BANTUAN = ["tukang", "okupasi_terapis", "fisioterapis", "arsitek", "komunitas"] as const;

export const bantuanSchema = z.object({
  jenis: z.enum(JENIS_BANTUAN),
  keterangan: teks,
});

export const AKTIVITAS = ["mandi", "toilet", "wudhu", "grooming", "umum"] as const;
export const ALAT_BANTU = ["kursi_roda", "kruk", "walker"] as const;
export const HUNIAN = ["milik_sendiri", "kontrakan", "kos", "apartemen"] as const;
export const TINGKAT_BIAYA = ["nol", "rendah", "tinggi"] as const;

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
    sumber: z.array(z.object({ judul: teks, url: z.string().url().optional() })).optional(),
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

export const asesmenSchema = z.object({
  aktivitas: z
    .array(z.object({ id: z.enum(AKTIVITAS), label: teks, bisaDipilihPrioritas: z.boolean() }))
    .min(1),
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
    z.object({
      id: teks,
      pertanyaan: teks,
      bantuan: teks.optional(),
      banyakPilihan: z.boolean(),
      pilihan: z.array(opsi.extend({ bulanMaks: z.number().nullable().optional() })).min(2),
    }),
  ),
});

const rekamTeks = z.record(z.string(), teks);

// Teks antarmuka. Bagian baru ditambahkan di sini bersama content/ui.json.
export const uiSchema = z
  .object({
    app: z.object({ nama: teks }),
    beranda: z.object({
      manfaat: teks,
      langkah: z.array(z.object({ judul: teks, isi: teks })).length(3),
      tombolMulai: teks,
      spandukDraf: teks,
      tautanIgd: teks,
      tautanHapus: teks,
    }),
    umum: rekamTeks,
    igd: z.object({ judul: teks, isi: teks }),
    hapusData: z.object({
      judul: teks, penjelasan: teks, tombol: teks, selesai: teks, konfirmasi: teks, ya: teks, batal: teks,
    }),
    onboarding: z.object({ judul: teks, indikator: teks, lanjutTerakhir: teks }),
    asesmen: z.object({ judul: teks, sementara: teks }),
    checkin: z.object({
      pertanyaan: teks,
      pilihan: z.array(opsi.extend({ balasan: teks })).min(1),
      penutup: teks,
    }),
  })
  .strict();

export type Kartu = z.infer<typeof kartuSchema>;
export type TingkatSolusi = z.infer<typeof tingkatSolusiSchema>;
export type Barang = z.infer<typeof barangSchema>;
export type Asesmen = z.infer<typeof asesmenSchema>;
export type Pertanyaan = Asesmen["pertanyaan"][number];
export type Config = z.infer<typeof configSchema>;
export type Onboarding = z.infer<typeof onboardingSchema>;
export type Ui = z.infer<typeof uiSchema>;
export type Aktivitas = (typeof AKTIVITAS)[number];
export type Hunian = (typeof HUNIAN)[number];
