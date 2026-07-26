// Maps a push notification payload onto an in-app destination.
//
// The Cloud Functions (functions/src/index.ts) send `{ type, slug, url }`, where
// `url` is the canonical site URL for the new content:
//   type "post"  -> https://www.tinnitushelp.me/blog/<slug>  -> Posts tab
//   type "sound" -> https://www.tinnitushelp.me/zen/<slug>   -> Sounds tab
//
// Anyone who learns an Expo push token can send to it, so the payload is
// untrusted input: the URL is host-checked against our own site before it is
// handed to a WebView, and the destination tab is derived from our own mapping
// rather than from anything the payload chooses.

/** Hosts we are willing to load in the in-app WebView from a notification. */
const ALLOWED_HOSTS = ["www.tinnitushelp.me", "tinnitushelp.me"];

type TabPath = "/(tabs)/posts" | "/(tabs)/sounds";

const TYPE_TO_TAB: Record<string, TabPath> = {
  post: "/(tabs)/posts",
  sound: "/(tabs)/sounds",
};

/** Fallback when `type` is missing or unrecognised: infer the tab from the path. */
const PATH_TO_TAB: { prefix: string; tab: TabPath }[] = [
  { prefix: "/blog", tab: "/(tabs)/posts" },
  { prefix: "/zen", tab: "/(tabs)/sounds" },
];

export interface NotificationTarget {
  pathname: TabPath;
  url: string;
}

/**
 * Extracts the `https://host` authority of a URL, lowercased.
 *
 * Deliberately hand-rolled rather than using `URL`: it must reject anything
 * that is not plain https, and stopping at the first `/`, `?` or `#` keeps
 * lookalikes such as `https://tinnitushelp.me.example.com` or
 * `https://example.com/@www.tinnitushelp.me` from matching the allowlist.
 */
function getHost(url: string): string | null {
  const match = /^https:\/\/([^/?#]+)/i.exec(url);
  return match ? match[1].toLowerCase() : null;
}

function isTrustedUrl(url: string): boolean {
  const host = getHost(url);
  return host !== null && ALLOWED_HOSTS.includes(host);
}

/** Adds the `isApp` flag the site uses to hide its own chrome inside the app. */
function withAppFlag(url: string): string {
  if (/[?&]isApp=/.test(url)) {
    return url;
  }
  return `${url}${url.includes("?") ? "&" : "?"}isApp=true`;
}

/**
 * Resolves the tab and URL a notification tap should open, or `null` when the
 * payload carries no usable (or no trustworthy) destination.
 */
export function resolveNotificationTarget(
  data: unknown
): NotificationTarget | null {
  if (typeof data !== "object" || data === null) {
    return null;
  }

  const { type, url } = data as { type?: unknown; url?: unknown };

  if (typeof url !== "string" || !isTrustedUrl(url)) {
    return null;
  }

  const tabFromType = typeof type === "string" ? TYPE_TO_TAB[type] : undefined;
  const path = url.slice(`https://${getHost(url)}`.length);
  const tabFromPath = PATH_TO_TAB.find(
    (entry) => path === entry.prefix || path.startsWith(`${entry.prefix}/`)
  )?.tab;

  const pathname = tabFromType ?? tabFromPath;
  if (!pathname) {
    return null;
  }

  return { pathname, url: withAppFlag(url) };
}
