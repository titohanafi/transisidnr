import type { ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { konten } from "../domain/content";

const { umum } = konten.ui;

const garis = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const TAB: { ke: string; label: string; ujung?: boolean; ikon: ReactNode }[] = [
  {
    ke: "/",
    label: umum.tabBeranda,
    ujung: true,
    ikon: <path d="M4 11l8-7 8 7v9H4zM10 20v-6h4v6" />,
  },
  {
    ke: "/jelajah",
    label: umum.tabPanduan,
    ikon: <path d="M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3zM8 20a3 3 0 0 1-3-3M9 9h6M9 13h6" />,
  },
  {
    ke: "/rencana",
    label: umum.tabRencana,
    ikon: <path d="M9 6h11M9 12h11M9 18h11M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2" />,
  },
  {
    ke: "/igd",
    label: umum.tabDarurat,
    ikon: <path d="M12 8v8M8 12h8M12 3l8 4v6c0 4-3.5 7-8 8-4.5-1-8-4-8-8V7z" />,
  },
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
                  <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true" {...garis}>
                    {t.ikon}
                  </svg>
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
