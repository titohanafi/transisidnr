import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Ikon, IlustrasiBeranda } from "../src/components/Ikon";
import { AKTIVITAS } from "../src/domain/konstanta";

const kunci = [...AKTIVITAS, "caregiver"] as const;

describe("ilustrasi", () => {
  it.each(kunci)("ikon %s dekoratif, ringan, dan tanpa teks", (k) => {
    const html = renderToStaticMarkup(<Ikon kunci={k} />);
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('focusable="false"');
    expect(html).not.toMatch(/<text|<image|href=|<title/);
    expect(html.length).toBeLessThan(1500);
  });

  it("setiap aktivitas dan kartu pendamping punya ikon yang berbeda", () => {
    const semua = kunci.map((k) => renderToStaticMarkup(<Ikon kunci={k} />));
    expect(new Set(semua).size).toBe(kunci.length);
  });

  it("ilustrasi Beranda dekoratif, ringan, tanpa teks, tanpa gambar eksternal", () => {
    const html = renderToStaticMarkup(<IlustrasiBeranda />);
    expect(html).toContain('aria-hidden="true"');
    expect(html).not.toMatch(/<text|<image|href=|http|<title/);
    expect(html.length).toBeLessThan(4000);
  });
});
