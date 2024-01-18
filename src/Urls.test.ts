import fc from "fast-check";

import { arbitraryLowerAlphaChar } from "./testing/String.arbitrary";
import { rightmostSubdomainOfUrl, subdomainOfUrl } from "./Urls";

describe("Urls utilities", () => {
  describe("subdomainOfUrl", () => {
    test("subdomain of URL matches starting substring of URL host", () => {
      fc.assert(
        fc.property(fc.webUrl(), (urlString) => {
          const url = new URL(urlString);
          const subdomain = subdomainOfUrl(url);

          expect(url.hostname.startsWith(subdomain ?? "")).toBe(true);
        }),
      );
    });
    test("subdomain of URL length < URL host length", () => {
      fc.assert(
        fc.property(fc.webUrl(), (urlString) => {
          const url = new URL(urlString);
          const subdomain = subdomainOfUrl(url);

          expect(subdomain?.length ?? 0).toBeLessThan(url.hostname.length);
        }),
      );
    });
    it("extracts the subdomain of a URL", () => {
      fc.assert(
        fc.property(
          fc
            .array(fc.stringOf(arbitraryLowerAlphaChar(), { minLength: 1 }))
            .map((parts) => parts.join(".")),
          fc.stringOf(arbitraryLowerAlphaChar(), { minLength: 1 }),
          fc.stringOf(arbitraryLowerAlphaChar(), { minLength: 2 }),
          (subdomain, domain, tld) => {
            const url = new URL(`https://${subdomain}.${domain}.${tld}`);
            const actual = subdomainOfUrl(url);

            expect(actual).toEqual(subdomain);
          },
        ),
      );
    });
  });

  describe("rightmostSubdomainOfUrl", () => {
    test("rightmost subdomain of URL matches ending substring of URL subdomain", () => {
      fc.assert(
        fc.property(fc.webUrl(), (urlString) => {
          const url = new URL(urlString);
          const subdomain = subdomainOfUrl(url);
          const rightmostSubdomain = rightmostSubdomainOfUrl(url);

          expect(subdomain?.endsWith(rightmostSubdomain ?? "")).toBe(true);
        }),
      );
    });
    test("rightmost subdomain of URL length <= URL subdomain length", () => {
      fc.assert(
        fc.property(fc.webUrl(), (urlString) => {
          const url = new URL(urlString);
          const subdomain = subdomainOfUrl(url);
          const rightmostSubdomain = rightmostSubdomainOfUrl(url);

          expect(rightmostSubdomain?.length ?? 0).toBeLessThanOrEqual(
            subdomain?.length ?? 0,
          );
        }),
      );
    });
  });
});
