import {
  asesmenSchema,
  configSchema,
  kartuSchema,
  kontakSchema,
  onboardingSchema,
  uiSchema,
  type Asesmen,
  type Config,
  type Kartu,
  type Kontak,
  type Onboarding,
  type Ui,
} from "./schema";

export interface KontenMentah {
  kartu: unknown[];
  asesmen: unknown;
  config: unknown;
  onboarding: unknown;
  ui: unknown;
  kontak: unknown;
}

export interface Konten {
  kartu: Kartu[];
  asesmen: Asesmen;
  config: Config;
  onboarding: Onboarding;
  ui: Ui;
  kontak: Kontak;
}

// Memeriksa seluruh konten. Melempar Error berisi semua masalah sekaligus.
export function validasiKonten(mentah: KontenMentah): Konten {
  const masalah: string[] = [];

  const kartu: Kartu[] = [];
  mentah.kartu.forEach((k, i) => {
    const r = kartuSchema.safeParse(k);
    if (r.success) kartu.push(r.data);
    else masalah.push(`kartu #${i + 1}: ${r.error.issues.map((x) => `${x.path.join(".")} ${x.message}`).join("; ")}`);
  });

  const asesmen = asesmenSchema.safeParse(mentah.asesmen);
  const config = configSchema.safeParse(mentah.config);
  const onboarding = onboardingSchema.safeParse(mentah.onboarding);
  const ui = uiSchema.safeParse(mentah.ui);
  const kontak = kontakSchema.safeParse(mentah.kontak);
  for (const [nama, r] of [
    ["asesmen", asesmen],
    ["config", config],
    ["onboarding", onboarding],
    ["ui", ui],
    ["kontak", kontak],
  ] as const) {
    if (!r.success) masalah.push(`${nama}: ${r.error.issues.map((x) => `${x.path.join(".")} ${x.message}`).join("; ")}`);
  }

  const ids = new Set<string>();
  for (const k of kartu) {
    if (ids.has(k.id)) masalah.push(`id kartu ganda: ${k.id}`);
    ids.add(k.id);
  }
  if (asesmen.success) {
    for (const p of asesmen.data.pertanyaan) {
      for (const id of p.memicu_kartu) {
        if (!ids.has(id)) masalah.push(`asesmen ${p.id}: memicu_kartu menunjuk id yang tidak ada: ${id}`);
      }
    }
  }

  if (masalah.length > 0) throw new Error("Konten tidak valid:\n- " + masalah.join("\n- "));
  return {
    kartu,
    asesmen: asesmen.data!,
    config: config.data!,
    onboarding: onboarding.data!,
    ui: ui.data!,
    kontak: kontak.data!,
  };
}
