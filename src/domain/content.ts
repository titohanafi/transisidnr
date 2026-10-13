import { validasiKonten } from "./validasi";

const kartuMentah = import.meta.glob("../../content/kartu/*.json", { eager: true, import: "default" });
import asesmen from "../../content/asesmen.json";
import config from "../../content/config.json";
import onboarding from "../../content/onboarding.json";
import ui from "../../content/ui.json";

// Konten dimuat dan divalidasi sekali. Bila salah, aplikasi gagal sejak awal.
export const konten = validasiKonten({
  kartu: Object.values(kartuMentah),
  asesmen,
  config,
  onboarding,
  ui,
});

// Angka teknis kartu draf hanya tampil bila flag dev menyala (tidak pernah di produksi).
export const TAMPILKAN_ANGKA_DRAF =
  import.meta.env.DEV && import.meta.env.VITE_TAMPILKAN_ANGKA_DRAF === "true";
