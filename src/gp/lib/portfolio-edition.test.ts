import { describe, expect, it } from "vitest";
import { MiniPdf } from "./pdf";
import { href, match } from "../router";
import { buildRoadmap } from "./engine/roadmap";
import { rankRoutes } from "./engine/rank";
import { SAMPLE_EVIDENCE, SAMPLE_FX, SAMPLE_PROFILE_FAMILY, SAMPLE_ROUTES } from "./engine/sample";

describe("portfolio edition", () => {
  it("writes a valid multi-page PDF with wrapped text", () => {
    const doc = new MiniPdf();
    doc.setFontSize(10);
    const lines = doc.splitTextToSize("word ".repeat(400), 300);
    expect(lines.length).toBeGreaterThan(10);
    for (const l of lines) expect(doc.measure(l)).toBeLessThanOrEqual(300);
    doc.text("Hello (world)", 48, 48);
    doc.addPage();
    doc.text("Page two", 48, 48);
    expect(doc.getNumberOfPages()).toBe(2);
  });

  it("builds and reads the app's hash routes", () => {
    expect(href({ to: "/analysis/$id", params: { id: "abc" } })).toBe("#lab-global-pathways/analysis/abc");
    expect(href({ to: "/intake", search: { step: 3 } })).toBe("#lab-global-pathways/intake?step=3");
    expect(href({ to: "/" })).toBe("#lab-global-pathways");
    expect(match("/roadmap/$id", "/roadmap/xyz")?.id).toBe("xyz");
    expect(match("/roadmap/$id", "/analysis/xyz")).toBe(null);
  });

  it("builds a roadmap that starts with checks to do before spending", () => {
    const ranking = rankRoutes(SAMPLE_ROUTES, SAMPLE_PROFILE_FAMILY, SAMPLE_FX, SAMPLE_EVIDENCE);
    const top = ranking.shown[0];
    if (!top) throw new Error("No ranked route");
    const steps = buildRoadmap(top.route, SAMPLE_PROFILE_FAMILY, SAMPLE_FX, SAMPLE_EVIDENCE);
    expect(steps.length).toBeGreaterThan(4);
    expect(steps[0]?.beforeSpending).toBe(true);
  });
});
