import asesmen from "../../content/asesmen.json";
import config from "../../content/config.json";
import onboarding from "../../content/onboarding.json";
import ui from "../../content/ui.json";
import type { Konten, KontenMentah } from "./validasi";

const kartuMentah = import.meta.glob("../../content/kartu/*.json", { eager: true, import: "default" });
const mentah: KontenMentah = { kartu: Object.values(kartuMentah), asesmen, config, onboarding, ui };

// Konten divalidasi dengan zod saat build (`npm run validasi`, bagian dari `npm run build`) dan di tes.
// Di peramban produksi zod tidak ikut dimuat supaya bundel kecil; di mode dev validasi tetap jalan
// dan galatnya muncul di konsol.
if (import.meta.env.DEV) {
  void import("./validasi").then((m) => {
    try {
      m.validasiKonten(mentah);
    } catch (e) {
      console.error(e);
    }
  });
}

export const konten = mentah as unknown as Konten;

// Angka teknis kartu draf hanya tampil bila flag dev menyala (tidak pernah di produksi).
export const TAMPILKAN_ANGKA_DRAF =
  import.meta.env.DEV && import.meta.env.VITE_TAMPILKAN_ANGKA_DRAF === "true";
