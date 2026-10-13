// Daftar nilai tetap. Dipisah dari schema.ts supaya aplikasi di peramban tidak ikut memuat zod.
export const TINGKAT = ["tanpa_biaya", "alat_tanpa_bongkar", "renovasi"] as const;
export type Tingkat = (typeof TINGKAT)[number];

export const STATUS_VALIDASI = ["draf", "ditinjau_ahli", "disetujui"] as const;
export const JENIS_BANTUAN = ["tukang", "okupasi_terapis", "fisioterapis", "arsitek", "komunitas"] as const;
export const AKTIVITAS = ["mandi", "toilet", "wudhu", "grooming", "umum"] as const;
export const ALAT_BANTU = ["kursi_roda", "kruk", "walker"] as const;
export const HUNIAN = ["milik_sendiri", "kontrakan", "kos", "apartemen"] as const;
export const TINGKAT_BIAYA = ["nol", "rendah", "tinggi"] as const;

export type Aktivitas = (typeof AKTIVITAS)[number];
export type Hunian = (typeof HUNIAN)[number];
