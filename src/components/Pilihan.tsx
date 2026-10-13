// Satu pilihan besar (radio atau checkbox) dengan area sentuh luas.
export function Pilihan({ tipe, nama, label, aktif, nonaktif, onUbah }: {
  tipe: "radio" | "checkbox";
  nama: string;
  label: string;
  aktif: boolean;
  nonaktif?: boolean;
  onUbah: () => void;
}) {
  return (
    <label
      className={`flex min-h-sentuh items-center gap-3 rounded-kartu border-2 p-3 ${
        aktif ? "border-utama bg-utama-muda font-semibold" : "border-garis bg-white"
      } ${nonaktif ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
    >
      <input
        type={tipe}
        name={nama}
        checked={aktif}
        disabled={nonaktif}
        onChange={onUbah}
        className="h-6 w-6 shrink-0 accent-utama"
      />
      <span>{label}</span>
    </label>
  );
}
