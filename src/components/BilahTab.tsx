import { BookOpen, House, ShieldAlert, UserRound, type LucideIcon } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { konten } from "../domain/content";

const { umum } = konten.ui;

const TAB: { ke: string; label: string; ujung?: boolean; alias?: string; Ikon: LucideIcon }[] = [
  { ke: "/", label: umum.tabBeranda, ujung: true, Ikon: House },
  { ke: "/rencana", label: umum.tabPanduan, alias: "/jelajah", Ikon: BookOpen },
  { ke: "/igd", label: umum.tabDarurat, Ikon: ShieldAlert },
  { ke: "/saya", label: umum.tabSaya, Ikon: UserRound },
];

// Layar alur pertanyaan dan cetak punya bilah sendiri (atau tanpa bilah), jadi tab disembunyikan.
const TANPA_TAB = /^\/(mulai|ruangan|asesmen|cetak)(\/|$)/;

/** Nama menu untuk judul header di layar menu utama; null untuk layar lain. */
export function namaMenu(path: string): string | null {
  const cocok = (p: string, ke: string) => p === ke || p.startsWith(ke + "/");
  const t = TAB.find((x) => (x.ujung ? path === x.ke : cocok(path, x.ke) || (x.alias ? cocok(path, x.alias) : false)));
  return t && !t.ujung ? t.label : null;
}

export function adaBilahTab(path: string) {
  return !TANPA_TAB.test(path);
}

// Menu utama di bawah layar, seperti aplikasi ponsel: dekat ibu jari.
export function BilahTab() {
  const { pathname } = useLocation();
  if (!adaBilahTab(pathname)) return null;
  return (
    <nav
      aria-label={umum.menuUtama}
      className="sticky bottom-0 z-10 border-t border-garis bg-white pb-[env(safe-area-inset-bottom)] print:hidden"
    >
      <ul className="flex">
        {TAB.map((t) => (
          <li key={t.ke} className="flex-1">
            <NavLink
              to={t.ke}
              end={t.ujung}
              className={({ isActive: aktif }) => {
                const isActive = aktif || (t.alias ? pathname === t.alias || pathname.startsWith(t.alias + "/") : false);
                return `flex min-h-[56px] flex-col items-center justify-center gap-0.5 px-1 text-xs font-semibold ${
                  isActive ? "bg-utama-muda text-utama-gelap" : "text-redup"
                }`;
              }}
            >
              {() => (
                <>
                  <t.Ikon className="h-6 w-6" strokeWidth={2} aria-hidden="true" focusable="false" />
                  <span>{t.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
