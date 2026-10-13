// Mengisi {nama} dalam teks dari content/ui.json.
export function isi(templat: string, nilai: Record<string, string | number>): string {
  return templat.replace(/\{(\w+)\}/g, (_, k: string) => (k in nilai ? String(nilai[k]) : `{${k}}`));
}
