import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { setAppHost } from "./router";

const FONTS = "https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,700;1,800&family=JetBrains+Mono:wght@400;500&display=swap";

/* Mounts Global Pathways AI inside a shadow root, so the app keeps its own design system
   and none of its styles reach the portfolio (or the portfolio's reach it). */
export function mountGlobalPathways(host: HTMLElement) {
  if (!document.querySelector(`link[data-gp-fonts]`)) {
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = FONTS;
    l.dataset.gpFonts = "";
    document.head.appendChild(l);
  }
  const shadow = host.shadowRoot ?? host.attachShadow({ mode: "open" });
  shadow.innerHTML = "";
  const css = document.createElement("link");
  css.rel = "stylesheet";
  css.href = "gp/app.css";
  const container = document.createElement("div");
  const layer = document.createElement("div");
  container.style.visibility = "hidden";
  css.onload = css.onerror = () => { container.style.visibility = ""; };
  shadow.append(css, container, layer);
  setAppHost(host);
  const root = createRoot(container);
  root.render(<StrictMode><App layer={layer} /></StrictMode>);
  return () => { root.unmount(); setAppHost(null); };
}
