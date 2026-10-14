import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link, type LinkProps } from "react-router-dom";

type Gaya = "utama" | "sekunder" | "bahaya";

const dasar =
  "tekan inline-flex min-h-sentuh min-w-sentuh items-center justify-center rounded-tombol px-5 py-2 text-base font-semibold text-center disabled:cursor-not-allowed disabled:opacity-50";
const gaya: Record<Gaya, string> = {
  utama: "bg-utama text-white shadow-sm hover:bg-utama-gelap disabled:hover:bg-utama",
  sekunder: "border border-utama/60 bg-white text-utama hover:bg-utama-muda",
  bahaya: "bg-bahaya text-white hover:opacity-90",
};

export function Tombol({ gayaTombol = "utama", className = "", ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { gayaTombol?: Gaya }) {
  return <button type="button" className={`${dasar} ${gaya[gayaTombol]} ${className}`} {...p} />;
}

export function TombolLink({
  gayaTombol = "utama",
  className = "",
  children,
  ...p
}: LinkProps & { gayaTombol?: Gaya; children: ReactNode }) {
  return (
    <Link className={`${dasar} ${gaya[gayaTombol]} ${className}`} {...p}>
      {children}
    </Link>
  );
}
