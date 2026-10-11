/**
 * The one place the site's public address lives. Canonical links, the
 * sitemap, robots.txt and every structured-data block build on this, so a
 * domain move is a one-line change instead of a hunt through the codebase.
 */
// The www host is the one that actually serves the site: the hosting setup
// 308-redirects the bare domain to it. Canonicals and sitemap URLs must name
// the address that answers with a 200, or Google sees every one redirect.
export const SITE_URL = "https://www.floraandflame.co";
export const SITE_NAME = "Flora & Flame";
