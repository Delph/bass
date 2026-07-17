import { useState } from '#app';
import { deepcopy } from '~/utility';

export type PersistedBucket<T> = {
  version: number;
  data: T;
};

export type PersistenceDump = {
  version: 0;
  exportedAt: string;
  buckets: Record<string, PersistedBucket<unknown>>;
};

const GZIP_PREFIX = 'bass:gzip:';

export type Bucket<T> = {
  key: string;
  version: number;
  initial: T;
  migrate: (version: number, stored: unknown) => T;
};

type State<T> = {
  value: T;
};

type RegisteredBucket = {
  key: string;
  dump: () => PersistedBucket<unknown>;
  parse: (stored: unknown) => unknown;
  reset: () => unknown;
  restore: (stored: unknown) => unknown;
  restoreData: (data: unknown) => unknown;
};

const buckets = new Map<string, RegisteredBucket>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isPersistedBucket(value: unknown): value is PersistedBucket<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'version' in value &&
    'data' in value &&
    typeof value.version === 'number'
  );
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = '';
  const chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize)
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));

  return btoa(binary)
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');
}

function base64UrlToBytes(value: string) {
  const base64 = value
    .replaceAll('-', '+')
    .replaceAll('_', '/')
    .padEnd(Math.ceil(value.length / 4) * 4, '=');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

  return bytes;
}

async function gzip(value: string) {
  if (typeof CompressionStream === 'undefined') return null;

  const stream = new Blob([value])
    .stream()
    .pipeThrough(new CompressionStream('gzip'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function gunzip(bytes: Uint8Array) {
  if (typeof DecompressionStream === 'undefined')
    throw new Error('Compressed imports are not supported by this browser');

  const buffer = new Uint8Array(bytes).buffer;
  const stream = new Blob([buffer])
    .stream()
    .pipeThrough(new DecompressionStream('gzip'));
  return await new Response(stream).text();
}

export function current<T>(
  slug: string,
  data: Record<string, T>,
  create: () => T,
): T {
  data[slug] ??= create();
  return data[slug];
}

export function defineBucket<T>(bucket: Bucket<T>) {
  let stateRef: State<T> | undefined;

  function initial() {
    return deepcopy(bucket.initial) as T;
  }

  function load(): T {
    try {
      const raw = localStorage.getItem(bucket.key);

      if (raw === null) return initial();

      const parsed = JSON.parse(raw);
      if (!isPersistedBucket(parsed)) return initial();

      return bucket.migrate(parsed.version, parsed.data);
    } catch {
      return initial();
    }
  }

  function state() {
    stateRef ??= useState<T>(bucket.key, load);
    return stateRef;
  }

  function save(data: T) {
    try {
      const value = JSON.stringify({
        version: bucket.version,
        data,
      } satisfies PersistedBucket<T>);

      localStorage.setItem(bucket.key, value);
    } catch (error) {
      if (stateRef) stateRef.value = load();

      throw error;
    }
  }

  function dump(): PersistedBucket<T> {
    return {
      version: bucket.version,
      data: load(),
    };
  }

  function parse(stored: unknown) {
    if (!isPersistedBucket(stored))
      throw new Error(`Invalid persisted bucket ${bucket.key}`);

    return bucket.migrate(stored.version, stored.data);
  }

  function restoreData(data: T) {
    save(data);

    if (stateRef) stateRef.value = data;

    return data;
  }

  function restore(stored: unknown) {
    return restoreData(parse(stored));
  }

  function reset() {
    localStorage.removeItem(bucket.key);
    const value = load();

    if (stateRef) stateRef.value = value;

    return value;
  }

  buckets.set(bucket.key, {
    key: bucket.key,
    dump,
    parse,
    reset,
    restore,
    restoreData: (data: unknown) => restoreData(data as T),
  });

  return {
    dump,
    key: bucket.key,
    load,
    parse,
    reset,
    restore,
    restoreData,
    save,
    state,
  };
}

export function dump(): PersistenceDump {
  return {
    version: 0,
    exportedAt: new Date().toISOString(),
    buckets: Object.fromEntries(
      [...buckets.values()].map((bucket) => [bucket.key, bucket.dump()]),
    ),
  };
}

export function reset() {
  for (const bucket of buckets.values()) bucket.reset();
}

export function restore(data: unknown) {
  if (!isRecord(data) || data.version !== 0 || !isRecord(data.buckets))
    throw new Error('Invalid BASS data export');

  const restored = Object.entries(data.buckets)
    .map(([key, stored]) => {
      const bucket = buckets.get(key);
      if (!bucket) return;

      return [bucket, bucket.parse(stored)] as const;
    })
    .filter((entry): entry is readonly [RegisteredBucket, unknown] =>
      entry !== undefined,
    );
  const previous = [...buckets.values()].map(
    (bucket) => [bucket, bucket.dump()] as const,
  );

  try {
    reset();

    for (const [bucket, value] of restored) bucket.restoreData(value);
  } catch (error) {
    try {
      reset();

      for (const [bucket, value] of previous) bucket.restore(value);
    } catch {
      throw new Error('Import failed and previous data could not be restored');
    }

    throw error;
  }
}

export async function exportText() {
  const data = dump();
  const json = JSON.stringify(data);
  const compressed = await gzip(json);

  if (!compressed) return JSON.stringify(data, null, 2);

  return `${GZIP_PREFIX}${bytesToBase64Url(compressed)}`;
}

export async function importText(value: string) {
  const text = value.trim();
  const json = text.startsWith(GZIP_PREFIX)
    ? await gunzip(base64UrlToBytes(text.slice(GZIP_PREFIX.length)))
    : text;

  restore(JSON.parse(json));
}
