import { useEffect, useMemo, useState } from "react";
import { AksiHalaman, KembaliKeRencana, useKonteksAksi } from "../components/AksiHalaman";
import { Tombol } from "../components/Tombol";
import { konten } from "../domain/content";
import { pilihanPertanyaan } from "../domain/onboarding";
import { butirBrief, susunBrief, urlWhatsApp, type Butir } from "../lib/brief";
import { track } from "../lib/events";
import { useStore } from "../state/store";

const t = konten.ui.aksi.tukang;

// Nama ruangan dari tag kartu; id yang belum punya nama diubah jadi teks biasa.
const namaRuangan = (id: string | undefined): string | null =>
  id ? (konten.config.ruangan.find((r) => r.id === id)?.nama ?? id.replace(/_/g, " ")) : null;

async function salinKeClipboard(teks: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(teks);
    return true;
  } catch {
    try {
      const el = document.createElement("textarea");
      el.value = teks;
      el.setAttribute("readonly", "");
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      const ok = document.execCommand("copy");
      el.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

export function AksiTukang() {
  const ctx = useKonteksAksi();
  if (!ctx) return <KembaliKeRencana />;
  return <Brief kartu={ctx.kartu} tingkat={ctx.tingkat} />;
}

function Brief({ kartu, tingkat }: NonNullable<ReturnType<typeof useKonteksAksi>>) {
  const { state, foto } = useStore();
  const jawab = (id: string) => state.onboarding[id]?.[0] ?? null;
  const label = (qid: string, id: string | null) =>
    pilihanPertanyaan(
      konten.onboarding.pertanyaan.find((q) => q.id === qid),
      konten.config,
    ).find((p) => p.id === id)?.label ?? null;

  const awal = useMemo(
    () =>
      butirBrief(
        {
          kartu,
          tingkat,
          hunianId: jawab("hunian"),
          hunianLabel: label("hunian", jawab("hunian")),
          budgetLabel: label("budget", jawab("budget")),
          budgetBelumTahu: jawab("budget") === null || jawab("budget") === "belum_tahu",
          adaFoto: foto !== null,
          ruanganLabel: namaRuangan(kartu.tag.ruangan[0]),
        },
        konten.ui.aksi.brief,
      ),
    // Brief disusun sekali saat halaman dibuka; suntingan pengguna tidak ditimpa.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [kartu.id, tingkat],
  );
  const [butir, setButir] = useState<Butir[]>(awal);
  const [status, setStatus] = useState<"" | "tersalin" | "gagal">("");

  useEffect(() => {
    track("brief_dibuat", { kartu_id: kartu.id });
  }, [kartu.id]);

  const ubah = (id: string, p: Partial<Butir>) => {
    setStatus("");
    setButir((b) => b.map((x) => (x.id === id ? { ...x, ...p } : x)));
  };
  const pesan = susunBrief(butir);

  return (
    <AksiHalaman judul={t.judul} kartu={kartu} tingkat={tingkat}>
      <p className="mt-3">{t.bantuan}</p>

      <ul className="mt-4 space-y-3">
        {butir.map((x) => (
          <li key={x.id} className="rounded-kartu border border-garis/70 bg-white shadow-kartu p-3">
            <label className="flex min-h-sentuh items-center gap-3 font-semibold">
              <input
                type="checkbox"
                checked={x.ikut}
                onChange={(e) => ubah(x.id, { ikut: e.target.checked })}
                className="h-6 w-6 shrink-0 accent-utama"
              />
              {t.ikutkan}
            </label>
            <label className="mt-1 block">
              <span className="sr-only">{t.ubahTeks}</span>
              <textarea
                value={x.teks}
                onChange={(e) => ubah(x.id, { teks: e.target.value })}
                rows={Math.min(8, x.teks.split("\n").length + 1)}
                className="mt-1 w-full rounded-tombol border border-garisKontrol p-2 text-base"
              />
            </label>
          </li>
        ))}
      </ul>

      <h2 className="mt-6 text-lg font-bold">{t.pratinjau}</h2>
      {pesan ? (
        <pre className="mt-2 whitespace-pre-wrap break-words rounded-kartu border border-garis/70 bg-white shadow-kartu p-3 font-sans text-base">
          {pesan}
        </pre>
      ) : (
        <p className="mt-2 text-redup">{t.kosong}</p>
      )}

      <div className="mt-4 flex flex-col gap-3">
        <a
          href={pesan ? urlWhatsApp(pesan) : undefined}
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={!pesan}
          onClick={(e) => {
            if (!pesan) return e.preventDefault();
            track("aksi_klik", { jenis: "brief_whatsapp", kartu_id: kartu.id });
          }}
          className={`inline-flex min-h-sentuh items-center justify-center rounded-tombol bg-utama px-5 py-2 font-semibold text-white hover:bg-utama-gelap ${
            pesan ? "" : "pointer-events-none opacity-50"
          }`}
        >
          {t.kirimWa}
        </a>
        <p className="text-sm text-redup">{t.waCatatan}</p>
        <Tombol
          gayaTombol="sekunder"
          disabled={!pesan}
          onClick={async () => {
            track("aksi_klik", { jenis: "brief_salin", kartu_id: kartu.id });
            setStatus((await salinKeClipboard(pesan)) ? "tersalin" : "gagal");
          }}
        >
          {t.salin}
        </Tombol>
        <p role="status" className="min-h-6">
          {status === "tersalin" ? t.tersalin : status === "gagal" ? t.gagalSalin : ""}
        </p>
      </div>
    </AksiHalaman>
  );
}
