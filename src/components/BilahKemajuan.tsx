// Bilah kemajuan bersegmen: satu segmen per langkah. Informasi juga ada di teks "Pertanyaan n dari N", bukan hanya warna.
export function BilahKemajuan({ n, total, label, className = "mt-2" }: { n: number; total: number; label: string; className?: string }) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={n}
      className={`flex gap-1 ${className}`}
    >
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`h-1.5 flex-1 rounded-full ${i < n ? "bg-utama" : "bg-garis"}`} />
      ))}
    </div>
  );
}
