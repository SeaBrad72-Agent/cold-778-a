// Short links: the pure logic behind POST /api/v1/links and GET /<code> (APP-1).
// Held in memory: ADR-000 defers the data store, so links do not survive a restart.
import { randomInt } from 'node:crypto';

const CODE_LENGTH = 7;
const CODE_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const CODE_PATTERN = /^[A-Za-z0-9]{7}$/;
const MAX_URL_LENGTH = 2048;
const MAX_CREATE_ATTEMPTS = 5;
const DEFAULT_MAX_LINKS = 10_000;

export type CreateResult = { ok: true; code: string } | { ok: false; error: 'no-free-code' | 'full' };

export interface LinkStore {
  create(url: string): CreateResult;
  resolve(code: string): string | undefined;
}

export interface LinkStoreOptions {
  generateCode?: () => string;
  maxLinks?: number;
}

// A random 7-character base62 code: 62^7 (about 3.5e12) values, drawn with crypto.randomInt
// (uniform, no modulo bias), so codes cannot be guessed from earlier ones.
export function randomCode(): string {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i += 1) code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  return code;
}

export function isShortCode(value: string): boolean {
  return CODE_PATTERN.test(value);
}

// Only absolute http(s) URLs without embedded credentials, at most 2048 characters. Anything else
// (javascript:, data:, file:, relative paths, user:pass@host) is refused, so a short link can only
// ever redirect to an ordinary web page. Returns the normalised href, or null when refused.
export function validateTargetUrl(input: unknown): string | null {
  if (typeof input !== 'string' || input.length === 0 || input.length > MAX_URL_LENGTH) return null;
  let parsed: URL;
  try {
    parsed = new URL(input);
  } catch {
    return null;
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
  if (parsed.username !== '' || parsed.password !== '') return null;
  return parsed.href;
}

export function createLinkStore(options: LinkStoreOptions = {}): LinkStore {
  const generateCode = options.generateCode ?? randomCode;
  const maxLinks = options.maxLinks ?? DEFAULT_MAX_LINKS;
  const links = new Map<string, string>();

  return {
    create(url: string): CreateResult {
      if (links.size >= maxLinks) return { ok: false, error: 'full' };
      // Retry on collision rather than overwrite: an existing short link must never change target.
      for (let attempt = 0; attempt < MAX_CREATE_ATTEMPTS; attempt += 1) {
        const code = generateCode();
        if (!links.has(code)) {
          links.set(code, url);
          return { ok: true, code };
        }
      }
      return { ok: false, error: 'no-free-code' };
    },
    resolve(code: string): string | undefined {
      return links.get(code);
    },
  };
}
