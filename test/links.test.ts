import { describe, expect, it } from 'vitest';
import type { AddressInfo } from 'node:net';
import { createLinkStore, isShortCode, validateTargetUrl } from '../src/links.js';
import { server } from '../src/server.js';

describe('validateTargetUrl', () => {
  it('accepts http and https URLs and returns the normalised href', () => {
    expect(validateTargetUrl('https://example.com/a?b=1')).toBe('https://example.com/a?b=1');
    expect(validateTargetUrl('http://example.com')).toBe('http://example.com/');
  });

  it.each([
    ['a non-string', 42],
    ['an empty string', ''],
    ['a relative path', '/just/a/path'],
    ['a javascript: URL', 'javascript:alert(1)'],
    ['a data: URL', 'data:text/html,hi'],
    ['a file: URL', 'file:///etc/passwd'],
    ['a URL carrying credentials', 'https://user:pass@example.com/'],
    ['a URL over 2048 characters', `https://example.com/${'a'.repeat(2048)}`],
  ])('refuses %s', (_label, input) => {
    expect(validateTargetUrl(input)).toBeNull();
  });
});

describe('isShortCode', () => {
  it('accepts exactly seven base62 characters', () => {
    expect(isShortCode('aZ09bY8')).toBe(true);
  });

  it.each(['', 'abc', 'abcdefgh', 'abc-def', 'abc/def', 'abcdef!'])('refuses %j', (code) => {
    expect(isShortCode(code)).toBe(false);
  });
});

describe('createLinkStore', () => {
  it('creates a link and resolves it back to its URL', () => {
    const store = createLinkStore();
    const created = store.create('https://example.com/');
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    expect(isShortCode(created.code)).toBe(true);
    expect(store.resolve(created.code)).toBe('https://example.com/');
  });

  it('returns undefined for an unknown code', () => {
    expect(createLinkStore().resolve('zzzzzzz')).toBeUndefined();
  });

  it('retries when a generated code collides', () => {
    const codes = ['AAAAAAA', 'AAAAAAA', 'BBBBBBB'];
    const store = createLinkStore({ generateCode: () => codes.shift() ?? 'CCCCCCC' });
    const first = store.create('https://one.example/');
    const second = store.create('https://two.example/');
    expect(first).toEqual({ ok: true, code: 'AAAAAAA' });
    expect(second).toEqual({ ok: true, code: 'BBBBBBB' });
    expect(store.resolve('AAAAAAA')).toBe('https://one.example/');
    expect(store.resolve('BBBBBBB')).toBe('https://two.example/');
  });

  it('gives up after repeated collisions instead of overwriting a link', () => {
    const store = createLinkStore({ generateCode: () => 'AAAAAAA' });
    store.create('https://one.example/');
    expect(store.create('https://two.example/')).toEqual({ ok: false, error: 'no-free-code' });
    expect(store.resolve('AAAAAAA')).toBe('https://one.example/');
  });

  it('never hands out a code the server already routes', () => {
    const codes = ['healthz', 'metrics', 'CCCCCCC'];
    const store = createLinkStore({ generateCode: () => codes.shift() ?? 'DDDDDDD' });
    expect(store.create('https://example.com/')).toEqual({ ok: true, code: 'CCCCCCC' });
    expect(store.resolve('healthz')).toBeUndefined();
  });

  it('refuses new links once full, so memory stays bounded', () => {
    const store = createLinkStore({ maxLinks: 1 });
    expect(store.create('https://one.example/').ok).toBe(true);
    expect(store.create('https://two.example/')).toEqual({ ok: false, error: 'full' });
  });

  it('generates codes from cryptographic randomness by default', () => {
    const store = createLinkStore();
    const seen = new Set<string>();
    for (let i = 0; i < 50; i += 1) {
      const result = store.create(`https://example.com/${i}`);
      expect(result.ok).toBe(true);
      if (result.ok) seen.add(result.code);
    }
    expect(seen.size).toBe(50);
  });
});

describe('HTTP: create and resolve a short link', () => {
  async function withServer(run: (base: string) => Promise<void>): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, () => {
        server.off('error', reject);
        resolve();
      });
    });
    const { port } = server.address() as AddressInfo;
    try {
      await run(`http://127.0.0.1:${port}`);
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  }

  function postLink(base: string, body: string, contentType = 'application/json'): Promise<Response> {
    return fetch(`${base}/api/v1/links`, { method: 'POST', headers: { 'Content-Type': contentType }, body });
  }

  it('creates a link with 201 and redirects its code to the URL with 302', async () => {
    await withServer(async (base) => {
      const created = await postLink(base, JSON.stringify({ url: 'https://example.com/page' }));
      expect(created.status).toBe(201);
      const body = (await created.json()) as { code: string; url: string; path: string };
      expect(isShortCode(body.code)).toBe(true);
      expect(body.url).toBe('https://example.com/page');
      expect(body.path).toBe(`/${body.code}`);
      expect(created.headers.get('location')).toBe(`/${body.code}`);

      const resolved = await fetch(`${base}/${body.code}`, { redirect: 'manual' });
      expect(resolved.status).toBe(302);
      expect(resolved.headers.get('location')).toBe('https://example.com/page');
    });
  });

  it('answers 404 for an unknown or malformed code', async () => {
    await withServer(async (base) => {
      expect((await fetch(`${base}/zzzzzzz`, { redirect: 'manual' })).status).toBe(404);
      expect((await fetch(`${base}/not-a-code`, { redirect: 'manual' })).status).toBe(404);
    });
  });

  it.each([
    ['malformed JSON', '{not json'],
    ['a body with no url', JSON.stringify({ link: 'https://example.com/' })],
    ['a javascript: URL', JSON.stringify({ url: 'javascript:alert(1)' })],
    ['a JSON array', JSON.stringify(['https://example.com/'])],
  ])('refuses %s with 400', async (_label, body) => {
    await withServer(async (base) => {
      const res = await postLink(base, body);
      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({ error: 'invalid url' });
    });
  });

  it.each([
    ['a form body', 'application/x-www-form-urlencoded'],
    ['a look-alike media type', 'application/jsonx'],
  ])('refuses %s with 415', async (_label, contentType) => {
    await withServer(async (base) => {
      const res = await postLink(base, JSON.stringify({ url: 'https://example.com/' }), contentType);
      expect(res.status).toBe(415);
    });
  });

  it('accepts JSON with a charset parameter', async () => {
    await withServer(async (base) => {
      const res = await postLink(base, JSON.stringify({ url: 'https://example.com/' }), 'application/json; charset=utf-8');
      expect(res.status).toBe(201);
    });
  });

  it('refuses a body over 4 KiB with 413', async () => {
    await withServer(async (base) => {
      const res = await postLink(base, JSON.stringify({ url: `https://example.com/${'a'.repeat(5000)}` }));
      expect(res.status).toBe(413);
    });
  });
});
