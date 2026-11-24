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
/** Registered business name, as it appears on the state license. */
export const LEGAL_NAME = "Flora & Flame, LLC";
/**
 * California Department of Cannabis Control license, written exactly as the
 * state's public record shows it (real.cannabis.ca.gov). State advertising
 * rules require it on marketing, and matching the record character for
 * character is also how a search engine ties this site to the licensee.
 */
export const LICENSE_NUMBER = "C12-0000449-LIC";
