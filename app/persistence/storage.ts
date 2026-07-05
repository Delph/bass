type PersistedBucket<T> = {
  version: number;
  data: T;
};

export type Bucket<T> = {
  key: string;
  version: number;
  initial: T;
  migrate: (version: number, stored: unknown) => T;
};

function isPersistedBucket(value: unknown): value is PersistedBucket<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'version' in value &&
    'data' in value &&
    typeof value.version === 'number'
  );
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
  function load(): T {
    const raw = localStorage.getItem(bucket.key);

    // if we have no data, return the initial value
    if (raw === null) return bucket.initial;

    const parsed = JSON.parse(raw);
    if (!isPersistedBucket(parsed)) return bucket.initial;

    return bucket.migrate(parsed.version, parsed.data);
  }

  function save(data: T) {
    return localStorage.setItem(
      bucket.key,
      JSON.stringify({
        version: bucket.version,
        data,
      } satisfies PersistedBucket<T>),
    );
  }

  function reset() {
    return localStorage.removeItem(bucket.key);
  }

  return {
    load,
    save,
  };
}
