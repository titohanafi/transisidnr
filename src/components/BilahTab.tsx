import { BookOpen, House, ListChecks, ShieldAlert, UserRound, type LucideIcon } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { konten } from "../domain/content";

const { umum } = konten.ui;

const TAB: { ke: string; label: string; ujung?: boolean; Ikon: LucideIcon }[] = [
  { ke: "/", label: umum.tabBeranda, ujung: true, Ikon: House },
  { ke: "/jelajah", label: umum.tabPanduan, Ikon: BookOpen },
  { ke: "/rencana", label: umum.tabRencana, Ikon: ListChecks },
  { ke: "/igd", label: umum.tabDarurat, Ikon: ShieldAlert },
  { ke: "/saya", label: umum.tabSaya, Ikon: UserRound },
];

// Layar alur pertanyaan dan cetak punya bilah sendiri (atau tanpa bilah), jadi tab disembunyikan.
const TANPA_TAB = /^\/(mulai|ruangan|asesmen|cetak)(\/|$)/;

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
              className={({ isActive }) =>
                `flex min-h-[56px] flex-col items-center justify-center gap-0.5 px-1 text-xs font-semibold ${
                  isActive ? "bg-utama-muda text-utama-gelap" : "text-redup"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <t.Ikon className="h-6 w-6" strokeWidth={2} aria-hidden="true" focusable="false" />
                  <span className={isActive ? "underline decoration-2 underline-offset-4" : ""}>{t.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
