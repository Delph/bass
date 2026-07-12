import type { DeepPartial } from '~/types';

export function bound(a: number, min: number, max: number) {
  if (max < min) throw Error(`Max (${max}) is less than min (${min})`);
  return Math.min(Math.max(a, min), max);
}

export function* chunk<T>(array: T[], size: number): Generator<T[]> {
  for (let i = 0, l = array.length / size; i < l; ++i)
    yield array.slice(i * size, (i + 1) * size);
}

export function deepcopy(data: any) {
  return JSON.parse(JSON.stringify(data));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function merge<T extends object>(base: T, overrides: DeepPartial<T>): T {
  const result: T = { ...base };

  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) continue;

    const existing = result[key as keyof T];
    result[key as keyof T] =
      isRecord(existing) && isRecord(value) ? merge(existing, value) : value;
  }

  return result;
}

export function unique<T>(
  array: T[],
  extractor: (t: T) => number | string | boolean,
): T[] {
  const seen: Set<number | string | boolean> = new Set();
  return array.filter((item) => {
    const key = extractor(item);
    return seen.has(key) ? false : seen.add(key);
  });
}

export function omit<T extends object, K extends keyof T>(
  object: T,
  key: K | K[],
): Omit<T, K> {
  const obj: Partial<T> = { ...object };
  const keys = Array.isArray(key) ? key : [key];

  for (const k of keys) delete obj[k];

  return obj as Omit<T, K>;
}

export function pick<T extends object, K extends keyof T>(
  object: T,
  key: K | K[],
): Pick<T, K> {
  const obj = {} as Pick<T, K>;
  const keys = Array.isArray(key) ? key : [key];

  for (const k of keys) obj[k] = object[k];

  return obj;
}

export function sum(array: number[]) {
  return array.reduce((a, c) => a + c, 0);
}

export function product(array: number[]) {
  return array.reduce((a, c) => a * c, 1);
}

/**
 * @brief A range generator, akin to Python's range() function
 * @details Generates a series of numbers in the range provided (inclusive, exclusive). The range can run in either direction (ascending or descending) and can step whatever amount is necessary.
 *
 * @param start The value to start at, inclusive
 * @param stop The value to stop at, exclusive
 * @param step The amount to step each iteration
 * @return Generator instance
 */
export function* range(start: number, stop: number, step: number = 1) {
  for (let i = start; step > 0 ? i < stop : i > stop; i += step) {
    yield i;
  }
}

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
