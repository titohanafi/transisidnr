import { Navigate } from "react-router-dom";
import { Halaman } from "../components/Halaman";
import { LencanaStatus } from "../components/Lencana";
import { PeringatanNonMedis } from "../components/PeringatanNonMedis";
import { Tombol, TombolLink } from "../components/Tombol";
import { TAMPILKAN_ANGKA_DRAF, konten } from "../domain/content";
import { kunciChecklist } from "../domain/aksi";
import { susunTingkat } from "../domain/engine";
import { bolehTampilkanUkuran } from "../domain/ukuran";
import { useRencana } from "../state/useRencana";
import { useStore } from "../state/store";

const { aksi, kartu: tk, umum, beranda } = konten.ui;
const t = aksi.cetak;

// Versi cetak: judul, rencana, kartu terpilih, foto bila ada. Dicetak lewat window.print().
export function Cetak() {
  const { state, foto } = useStore();
  const { rencana, konteks } = useRencana();
  if (Object.keys(state.asesmen.status).length === 0) return <Navigate to="/asesmen/aktivitas" replace />;

  const idKartu = rencana.urutanTampil;
  const satuHal = rencana.satuHalHariIni;

  return (
    <Halaman judul={t.judulKertas}>
      <div className="mt-3 flex flex-col gap-2 print:hidden">
        <p>{t.penjelasan}</p>
        <Tombol onClick={() => window.print()}>{t.tombol}</Tombol>
        <TombolLink to="/rencana" gayaTombol="sekunder">
          {konten.ui.kartu.kembaliKeRencana}
        </TombolLink>
      </div>

      <div className="mt-6 print:mt-0">
        <p className="mt-2 rounded-kartu border border-draf bg-draf-muda p-2 text-draf print:border-black print:bg-white print:text-black">
          {beranda.spandukDraf}
        </p>
        <PeringatanNonMedis />

        {satuHal && (
          <section className="mt-bagian break-inside-avoid" aria-labelledby="cetak-satu">
            <h2 id="cetak-satu" className="text-subjudul">
              {t.satuHal}
            </h2>
            <p className="mt-1">{satuHal.langkah}</p>
          </section>
        )}

        {idKartu.length === 0 && <p className="mt-5">{t.kosong}</p>}

        {idKartu.map((id) => {
          const k = konten.kartu.find((x) => x.id === id);
          if (!k) return null;
          const tingkat = susunTingkat(k, konteks).filter((x) => x.tampil);
          const ukuranBoleh = bolehTampilkanUkuran(k.status_validasi, TAMPILKAN_ANGKA_DRAF);
          return (
            <article key={id} className="mt-6 break-inside-avoid border-t border-garis pt-4">
              <h2 className="text-subjudul">{k.judul}</h2>
              <div className="mt-1 empty:hidden">
                <LencanaStatus status={k.status_validasi} />
              </div>
              <p className="mt-2">{k.situasi}</p>
              {k.isi_menyusul ? (
                <p className="mt-2 font-medium">{umum.isiMenyusul}</p>
              ) : (
                tingkat.map((x) => {
                  const s = k.solusi?.[x.tingkat];
                  if (!s) return null;
                  const selesai = state.checklist[kunciChecklist(id, x.tingkat)] ?? [];
                  return (
                    <section key={x.tingkat} className="mt-3 break-inside-avoid">
                      <h3 className="text-judulKartu">
                        {tk.tingkat[x.tingkat]} ({x.sifat === "sementara" ? umum.sementara : umum.permanen})
                        {x.ditandaiPermanen && ` · ${umum.menunggu}`}
                      </h3>
                      <ul className="mt-1 space-y-1">
                        {s.langkah.map((l, i) => (
                          <li key={i} className="flex gap-2">
                            <span aria-hidden="true">{selesai.includes(i) ? "☑" : "☐"}</span>
                            <span className="sr-only">{selesai.includes(i) ? t.langkahSelesai : t.langkahBelum}{" "}</span>
                            <span>{l}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-1 text-sm">
                        {tk.biaya}: {s.biaya.kisaran_rp ?? umum.biayaMenyusul}
                      </p>
                      {s.ukuran && s.ukuran.length > 0 && ukuranBoleh && (
                        <ul className="mt-1 list-disc pl-6 text-sm">
                          {s.ukuran.map((u) => (
                            <li key={u.label}>
                              {u.label}: {u.nilai} {u.satuan}
                            </li>
                          ))}
                        </ul>
                      )}
                    </section>
                  );
                })
              )}
              {k.peringatan && (
                <p className="mt-2 text-sm">
                  <span className="font-semibold">{tk.peringatan}:</span> {k.peringatan}
                </p>
              )}
            </article>
          );
        })}

        {foto && (
          <section className="mt-bagian break-inside-avoid border-t border-garis pt-4" aria-labelledby="cetak-foto">
            <h2 id="cetak-foto" className="text-subjudul">
              {t.foto}
            </h2>
            <img src={foto} alt={aksi.cetak.foto} className="mt-2 max-h-96 w-full object-contain" />
          </section>
        )}
      </div>
    </Halaman>
  );
}
