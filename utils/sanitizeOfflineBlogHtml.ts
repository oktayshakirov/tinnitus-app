/**
 * Strips MUI blog chrome from HTML saved for offline reading (tinnitushelp.me layout).
 */

function stripSidebarFromMd4(html: string): string {
  const marker = "MuiGrid-grid-md-4";
  const i = html.indexOf(marker);
  if (i === -1) return html;
  const divStart = html.lastIndexOf("<div", i);
  if (divStart === -1) return html;
  return html.slice(0, divStart);
}

function stripAllPostsLink(html: string): string {
  return html.replace(
    /<a[^>]*\bhref=(["'])\/blog(?:\?[^"']*)?\1[^>]*>[\s\S]*?<\/a>/gi,
    ""
  );
}

/** Removes the date + views row (two meta paragraphs) directly under the title h1. */
function stripTitleMetaRow(html: string): string {
  return html.replace(
    /<\/h1>\s*<div[^>]*>(?:\s*<p[^>]*>[\s\S]*?<\/p>){2}\s*<\/div>/gi,
    "</h1>"
  );
}

/** Unwraps <a> tags so only inner HTML (link text) remains. */
function stripAnchorTags(html: string): string {
  let out = html;
  let prev: string;
  do {
    prev = out;
    out = out.replace(/<a\b[^>]*>([\s\S]*?)<\/a>/gi, "$1");
  } while (out !== prev);
  return out;
}

export function sanitizeOfflineBlogHtml(html: string): string {
  let out = html.trim();
  if (!out) return out;

  out = stripSidebarFromMd4(out);
  out = stripAllPostsLink(out);
  out = stripTitleMetaRow(out);
  out = stripAnchorTags(out);

  return out.replace(/\n{3,}/g, "\n\n").trim();
}
