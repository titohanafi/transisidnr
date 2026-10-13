// Bilah kemajuan bersegmen: satu segmen per langkah. Informasi juga ada di teks "Pertanyaan n dari N", bukan hanya warna.
export function BilahKemajuan({ n, total, label }: { n: number; total: number; label: string }) {
  return (
    <div role="progressbar" aria-label={label} aria-valuemin={1} aria-valuemax={total} aria-valuenow={n} className="mt-2 flex gap-1">
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`h-2 flex-1 rounded-full ${i < n ? "bg-utama" : "bg-garis"}`} />
      ))}
    </div>
  );
}
