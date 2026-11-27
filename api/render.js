import fs from "node:fs";
import path from "node:path";
import { readJsonBlob } from "./_blob.js";

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function readIndexHtml() {
  const candidates = [
    path.join(process.cwd(), "index.html"),
    new URL("../index.html", import.meta.url),
  ];
  for (const candidate of candidates) {
    try {
      return fs.readFileSync(candidate, "utf8");
    } catch (_) {}
  }
  throw new Error("Could not locate index.html");
}

function resolveOgImage(src, origin) {
  const clean = String(src || "").trim();
  if (/^https?:\/\//i.test(clean)) return clean;
  if (clean && !clean.startsWith("data:")) {
    const normalized = clean.replace(/^\.\//, "/");
    return `${origin}${normalized.startsWith("/") ? "" : "/"}${normalized}`;
  }
  return `${origin}/assets/images/photos/hero-1.webp`;
}

export async function GET(request) {
  try {
    let html = readIndexHtml();
    const reqUrl = new URL(request.url);
    const origin = reqUrl.origin;
    const requestedTplId = reqUrl.searchParams.get("tpl");

    const store = await readJsonBlob("wedding/store.json").catch(() => null);
    if (store && Array.isArray(store.templates) && store.templates.length > 0) {
      const tpl =
        (requestedTplId && store.templates.find((t) => t.id === requestedTplId)) ||
        store.templates.find((t) => t.id === store.activeTemplateId) ||
        store.templates[0];

      if (tpl && tpl.couple) {
        const groom = tpl.couple.groomShort || "Chú Rể";
        const bride = tpl.couple.brideShort || "Cô Dâu";
        const title = `Thiệp Cưới ${groom} & ${bride}`;
        const dateText = tpl.couple.introDateText ? `${tpl.couple.introDateText}` : "";
        const venueText = (tpl.venue && (tpl.venue.address || tpl.venue.name)) || "";
        const description = [dateText, venueText].filter(Boolean).join(" • ") || `Trân trọng kính mời dự tiệc cưới ${groom} & ${bride}`;
        const ogImage = resolveOgImage(tpl.photos && tpl.photos.hero1, origin);

        html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
        html = html.replace(
          /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
          `<meta property="og:title" content="${escapeHtml(title)}" />`
        );
        html = html.replace(
          /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
          `<meta property="og:description" content="${escapeHtml(description)}" />`
        );
        html = html.replace(
          /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i,
          `<meta property="og:image" content="${escapeHtml(ogImage)}" />`
        );
      }
    }

    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err) {
    console.error("[api/render] GET error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
