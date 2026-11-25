/* A small PDF writer for the downloadable report. It implements the handful of jsPDF calls the
   original report used (text, wrapping, lines, pages, colours) with the standard Helvetica fonts,
   so the report keeps its layout without adding a dependency. Text must be Latin-1. */

type Style = "normal" | "bold" | "italic";

// Helvetica advance widths (1/1000 em) for ASCII 32–126, from the standard font metrics.
const REG = [278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584];
const BOLD = [278,333,474,556,556,889,722,238,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,333,333,584,584,584,611,975,722,722,722,722,667,611,778,722,278,556,722,611,833,722,778,667,778,722,667,611,722,667,944,667,667,611,333,278,333,584,556,333,556,611,556,611,556,333,611,611,278,278,556,278,889,611,611,611,611,389,556,333,611,556,778,556,556,500,389,280,389,584];

const FONT_KEY: Record<Style, string> = { normal: "F1", bold: "F2", italic: "F3" };

export class MiniPdf {
  readonly width = 595.28; // A4 in points
  readonly height = 841.89;
  private pages: string[][] = [[]];
  private current = 0;
  private font: Style = "normal";
  private size = 10;
  private color = "0 0 0";
  private stroke = "0 0 0";

  setFont(_family: string, style: Style) { this.font = style; }
  setFontSize(n: number) { this.size = n; }
  setTextColor(r: number, g: number, b: number) { this.color = [r, g, b].map((v) => (v / 255).toFixed(3)).join(" "); }
  setDrawColor(r: number, g: number, b: number) { this.stroke = [r, g, b].map((v) => (v / 255).toFixed(3)).join(" "); }
  addPage() { this.pages.push([]); this.current = this.pages.length - 1; }
  setPage(n: number) { this.current = n - 1; }
  getNumberOfPages() { return this.pages.length; }

  measure(s: string) {
    const t = this.font === "bold" ? BOLD : REG;
    let w = 0;
    for (const ch of s) { const c = ch.charCodeAt(0); w += c >= 32 && c <= 126 ? t[c - 32]! : 556; }
    return (w / 1000) * this.size;
  }

  /** Word-wraps text to a width in points, like jsPDF's splitTextToSize. */
  splitTextToSize(s: string, max: number): string[] {
    const out: string[] = [];
    for (const para of s.split("\n")) {
      let line = "";
      for (const word of para.split(/\s+/).filter(Boolean)) {
        const next = line ? `${line} ${word}` : word;
        if (this.measure(next) <= max || !line) line = next;
        else { out.push(line); line = word; }
        while (this.measure(line) > max && line.length > 1) {
          let cut = line.length - 1;
          while (cut > 1 && this.measure(line.slice(0, cut)) > max) cut--;
          out.push(line.slice(0, cut)); line = line.slice(cut);
        }
      }
      out.push(line);
    }
    return out;
  }

  text(s: string, x: number, y: number) {
    const esc = s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
    this.pages[this.current]!.push(`BT ${this.color} rg /${FONT_KEY[this.font]} ${this.size} Tf ${x.toFixed(2)} ${(this.height - y).toFixed(2)} Td (${esc}) Tj ET`);
  }

  line(x1: number, y1: number, x2: number, y2: number) {
    this.pages[this.current]!.push(`${this.stroke} RG 0.6 w ${x1.toFixed(2)} ${(this.height - y1).toFixed(2)} m ${x2.toFixed(2)} ${(this.height - y2).toFixed(2)} l S`);
  }

  output(): Blob {
    const objs: string[] = [];
    const add = (s: string) => { objs.push(s); return objs.length; };
    const catalog = add(""), pagesId = add("");
    const fonts = (["Helvetica", "Helvetica-Bold", "Helvetica-Oblique"] as const).map((f) => add(`<< /Type /Font /Subtype /Type1 /BaseFont /${f} /Encoding /WinAnsiEncoding >>`));
    const kids: number[] = [];
    for (const ops of this.pages) {
      const stream = ops.join("\n");
      const content = add(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
      kids.push(add(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${this.width} ${this.height}] /Contents ${content} 0 R /Resources << /Font << /F1 ${fonts[0]} 0 R /F2 ${fonts[1]} 0 R /F3 ${fonts[2]} 0 R >> >> >>`));
    }
    objs[catalog - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
    objs[pagesId - 1] = `<< /Type /Pages /Kids [${kids.map((k) => `${k} 0 R`).join(" ")}] /Count ${kids.length} >>`;
    let body = "%PDF-1.4\n";
    const offsets: number[] = [];
    objs.forEach((o, i) => { offsets.push(body.length); body += `${i + 1} 0 obj\n${o}\nendobj\n`; });
    const xref = body.length;
    body += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("")}`;
    body += `trailer\n<< /Size ${objs.length + 1} /Root ${catalog} 0 R >>\nstartxref\n${xref}\n%%EOF`;
    const bytes = new Uint8Array(body.length);
    for (let i = 0; i < body.length; i++) bytes[i] = body.charCodeAt(i) & 0xff;
    return new Blob([bytes], { type: "application/pdf" });
  }

  save(filename: string) {
    const url = URL.createObjectURL(this.output());
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }
}
