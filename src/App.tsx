import { konten } from "./domain/content";

// Kerangka sementara; layar sebenarnya dibangun di milestone 3 dan seterusnya.
export function App() {
  const { app, beranda } = konten.ui;
  return (
    <main className="mx-auto max-w-md p-4">
      <h1 className="text-2xl font-bold text-utama">{app.nama}</h1>
      <p className="mt-2">{beranda.manfaat}</p>
    </main>
  );
}
