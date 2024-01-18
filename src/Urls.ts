import { Undefined } from './Undefined'

/**
 * Given a list of {@link URLSearchParams}, appends them all, in order, to
 * `url`.
 *
 * Note that if there are duplicate query parameter keys, only the one occurring
 * latest in `params` will be kept.
 */
export function applyUrlSearchParams<T extends string = ''>(
  url: `${T}${string}`,
  ...params: readonly URLSearchParams[]
): `${T}${string}` {
  const combinedParams = new URLSearchParams()

  for (const p of params) {
    for (const [k, v] of p.entries()) {
      combinedParams.append(k, v)
    }
  }

  const rendered = combinedParams.toString()

  if (rendered.length === 0) return url

  return `${url}?${rendered}`
}

/**
 * Returns the subdomain of a URL as an array of parts, where
 * the parts originate from the URL as the strings between periods.
 * If there is no subdomain, an empty array is returned.
 *
 * Example URL: `"https://foobar.baz.example.com:1234/path"`
 * Result: `["foobar", "baz"]`
 */
function subdomainPartsOfUrl(url: URL): readonly string[] {
  return url.hostname.split('.').slice(0, -2)
}

/**
 * Returns the subdomain of a URL as a string.
 * If there is no subdomain, an empty string is returned.
 *
 * Example URL: `"https://foobar.baz.example.com:1234/path"`
 * Result: `"foobar.baz"`
 */
export function subdomainOfUrl(url: URL): string | undefined {
  return Undefined.map(url, (u) => subdomainPartsOfUrl(u).join('.'))
}

/**
 * Extracts the rightmost (highest) portion of the subdomain of a URL
 * as a string.
 * If there is no subdomain, `undefined` is returned.
 *
 * Example URL: `"https://foobar.baz.example.com:1234/path"`
 * Result: `"baz"`
 */
export function rightmostSubdomainOfUrl(url: URL): string | undefined {
  const parts = subdomainPartsOfUrl(url)
  return parts[parts.length - 1]
}
