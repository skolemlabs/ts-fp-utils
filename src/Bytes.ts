/**
 * Represents arbitrary data without an encoding, which can be rendered as a
 * {@link Uint8Array} or strings of several {@link Encoding}s.
 * */
export type Bytes = Readonly<{
  /** Renders the held bytes as a {@link Uint8Array}. */
  toUint8Array(): Uint8Array;
  /** Renders the held bytes as a string with the given {@link Encoding}. */
  toString(encoding?: Encoding): string;
}>;

/** Encodings supported by this library. */
export type Encoding = (typeof ENCODINGS)[number];
export const ENCODINGS = ["utf-8", "base-64", "base-64-url-safe"] as const;

/** Static utilities for {@link Bytes}. */
export const Bytes = {
  /** Builds a {@link Bytes} from the given {@link Uint8Array}. */
  ofUint8Array(bytes: Uint8Array): Bytes {
    const self = {
      toUint8Array(): Uint8Array {
        return bytes;
      },
      toString(encoding: Encoding = "utf-8"): string {
        switch (encoding) {
          case "utf-8": {
            return DECODERS["utf-8"].decode(bytes);
          }
          case "base-64": {
            return btoa(String.fromCharCode(...bytes));
          }
          case "base-64-url-safe": {
            return self
              .toString("base-64")
              .replaceAll("+", "-")
              .replaceAll("/", "_");
          }
        }
      },
    };

    return self;
  },
  /** Builds a {@link Bytes} from the given {@link string}, given the string's encoding. */
  ofString(str: string, encoding: Encoding): Bytes {
    switch (encoding) {
      case "utf-8": {
        return Bytes.ofUint8Array(UTF8_ENCODER.encode(str));
      }
      case "base-64": {
        return Bytes.ofUint8Array(
          Uint8Array.from(atob(str), (v) => v.charCodeAt(0)),
        );
      }
      case "base-64-url-safe": {
        return Bytes.ofString(
          str.replaceAll("-", "+").replaceAll("_", "/"),
          "base-64",
        );
      }
    }
  },
} as const;

/** Used to encode JavaScript strings into a utf-8 representation. */
const UTF8_ENCODER = new TextEncoder();

const DECODERS = {
  "utf-8": new TextDecoder("utf-8"),
  "utf-16": new TextDecoder("utf-16"),
} as const;
