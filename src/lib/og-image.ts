import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const CACHE_PATH = join(process.cwd(), '.og-cache.json');
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const FETCH_TIMEOUT_MS = 8000;

type CacheEntry = { url: string | null; fetchedAt: number };
type Cache = Record<string, CacheEntry>;

async function readCache(): Promise<Cache> {
  try {
    const data = await readFile(CACHE_PATH, 'utf-8');
    return JSON.parse(data) as Cache;
  } catch {
    return {};
  }
}

async function writeCache(cache: Cache): Promise<void> {
  try {
    await writeFile(CACHE_PATH, JSON.stringify(cache, null, 2));
  } catch (err) {
    console.warn('[og-image] failed to write cache:', (err as Error).message);
  }
}

function isFresh(entry: CacheEntry): boolean {
  return Date.now() - entry.fetchedAt < CACHE_TTL_MS;
}

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      signal: controller.signal,
      redirect: 'follow',
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function extractOgImage(html: string, baseUrl: string): string | null {
  const patterns = [
    /<meta\s+[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i,
    /<meta\s+[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i,
    /<meta\s+[^>]*name=["']og:image["'][^>]*content=["']([^"']+)["']/i,
    /<meta\s+[^>]*content=["']([^"']+)["'][^>]*name=["']og:image["']/i,
    /<meta\s+[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i,
    /<meta\s+[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i,
  ];
  for (const pat of patterns) {
    const m = html.match(pat);
    if (m) return resolveUrl(m[1], baseUrl);
  }
  return null;
}

function resolveUrl(url: string, base: string): string {
  try {
    return new URL(url, base).href;
  } catch {
    return url;
  }
}

export async function resolveProjectImage(
  manualImage: string | undefined,
  sourceUrl: string | undefined
): Promise<string | null> {
  if (manualImage) return manualImage;
  if (!sourceUrl) return null;

  const cache = await readCache();
  const cached = cache[sourceUrl];
  if (cached && isFresh(cached)) {
    return cached.url;
  }

  const html = await fetchHtml(sourceUrl);
  if (!html) {
    cache[sourceUrl] = { url: null, fetchedAt: Date.now() };
    await writeCache(cache);
    console.warn(`[og-image] no html from ${sourceUrl}`);
    return null;
  }

  const image = extractOgImage(html, sourceUrl);
  cache[sourceUrl] = { url: image, fetchedAt: Date.now() };
  await writeCache(cache);
  if (image) {
    console.log(`[og-image] ${sourceUrl} → ${image}`);
  } else {
    console.warn(`[og-image] no og:image found at ${sourceUrl}`);
  }
  return image;
}
