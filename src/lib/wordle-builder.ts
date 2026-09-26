/** Wordle Builder share-code codec (ADR 0024). Client-only; not a secret. */

export const BUILDER_MIN_LENGTH = 3;
export const BUILDER_MAX_LENGTH = 10;
export const BUILDER_CODE_VERSION = 1;

/** Rotating XOR key — light obfuscation only (TONNI). */
const OBFUSCATE_KEY = [0x54, 0x4f, 0x4e, 0x4e, 0x49];

export type BuilderEncodeError =
  | "empty"
  | "too-short"
  | "too-long"
  | "invalid-charset";

export type BuilderDecodeError =
  | "empty"
  | "bad-base64"
  | "too-short"
  | "bad-version"
  | "bad-length"
  | "bad-checksum"
  | "invalid-charset";

export type EncodeResult =
  | { ok: true; code: string; word: string; length: number }
  | { ok: false; error: BuilderEncodeError };

export type DecodeResult =
  | { ok: true; word: string; length: number; version: number }
  | { ok: false; error: BuilderDecodeError };

/** Guess budget scales slightly for longer custom words (ADR 0024). */
export function maxGuessesForLength(length: number): number {
  if (length <= 5) return 6;
  if (length <= 7) return 7;
  return 8;
}

export function normalizeSolutionInput(raw: string): string {
  return raw.replace(/[^a-zA-Z]/g, "").toUpperCase();
}

function validateWord(word: string): BuilderEncodeError | null {
  if (!word) return "empty";
  if (word.length < BUILDER_MIN_LENGTH) return "too-short";
  if (word.length > BUILDER_MAX_LENGTH) return "too-long";
  if (!/^[A-Z]+$/.test(word)) return "invalid-charset";
  return null;
}

function xorLetterByte(index: number, position: number): number {
  return (index ^ OBFUSCATE_KEY[position % OBFUSCATE_KEY.length]) & 0xff;
}

function checksum(bytes: number[]): number {
  return bytes.reduce((acc, b) => acc ^ b, 0) & 0xff;
}

function bytesToBase64Url(bytes: number[]): string {
  const bin = String.fromCharCode(...bytes);
  const b64 = globalThis.btoa(bin);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(code: string): number[] | null {
  const padded = code.replace(/-/g, "+").replace(/_/g, "/");
  const padLen = (4 - (padded.length % 4)) % 4;
  const b64 = padded + "=".repeat(padLen);
  try {
    const bin = globalThis.atob(b64);
    const out: number[] = [];
    for (let i = 0; i < bin.length; i++) out.push(bin.charCodeAt(i));
    return out;
  } catch {
    return null;
  }
}

/** Encode an A–Z solution into a URL-safe share code. */
export function encodeSolution(raw: string): EncodeResult {
  const word = normalizeSolutionInput(raw);
  const err = validateWord(word);
  if (err) return { ok: false, error: err };

  const length = word.length;
  const letters: number[] = [];
  for (let i = 0; i < length; i++) {
    const idx = word.charCodeAt(i) - 65; // A=0
    letters.push(xorLetterByte(idx, i));
  }

  const body = [BUILDER_CODE_VERSION, length, ...letters];
  const payload = [...body, checksum(body)];
  return {
    ok: true,
    code: bytesToBase64Url(payload),
    word: word.toLowerCase(),
    length,
  };
}

/** Decode a share code back to a lowercase solution word. */
export function decodeSolution(code: string): DecodeResult {
  const trimmed = code.trim();
  if (!trimmed) return { ok: false, error: "empty" };

  const bytes = base64UrlToBytes(trimmed);
  if (!bytes) return { ok: false, error: "bad-base64" };
  if (bytes.length < 4) return { ok: false, error: "too-short" };

  const version = bytes[0];
  if (version !== BUILDER_CODE_VERSION) {
    return { ok: false, error: "bad-version" };
  }

  const length = bytes[1];
  if (
    length < BUILDER_MIN_LENGTH ||
    length > BUILDER_MAX_LENGTH ||
    bytes.length !== length + 3
  ) {
    return { ok: false, error: "bad-length" };
  }

  const body = bytes.slice(0, -1);
  const expected = checksum(body);
  if (bytes[bytes.length - 1] !== expected) {
    return { ok: false, error: "bad-checksum" };
  }

  let word = "";
  for (let i = 0; i < length; i++) {
    const obfuscated = bytes[2 + i];
    const idx = xorLetterByte(obfuscated, i);
    if (idx < 0 || idx > 25) return { ok: false, error: "invalid-charset" };
    word += String.fromCharCode(65 + idx);
  }

  return {
    ok: true,
    word: word.toLowerCase(),
    length,
    version,
  };
}

export function builderPlayPath(code: string): string {
  return `/w/${code}`;
}

export function encodeErrorMessage(error: BuilderEncodeError): string {
  switch (error) {
    case "empty":
      return "Enter a word";
    case "too-short":
      return `Use at least ${BUILDER_MIN_LENGTH} letters`;
    case "too-long":
      return `Use at most ${BUILDER_MAX_LENGTH} letters`;
    case "invalid-charset":
      return "Letters A–Z only";
  }
}

export function decodeErrorMessage(error: BuilderDecodeError): string {
  switch (error) {
    case "empty":
      return "Missing puzzle code";
    case "bad-base64":
    case "too-short":
    case "bad-version":
    case "bad-length":
    case "bad-checksum":
    case "invalid-charset":
      return "This share link is invalid or damaged";
  }
}
