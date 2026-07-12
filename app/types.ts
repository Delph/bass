/**
 * "Flattens" a TypeScript type, removing utility types and similar to make it easier to ascertain a type
 */
export type Identity<T> = T extends infer U ? { [P in keyof U]: T[P] } : never;

/**
 * Recursively makes object properties optional while preserving functions and array shapes.
 */
export type DeepPartial<T> = T extends (...args: any[]) => any
  ? T
  : T extends readonly (infer U)[]
    ? readonly DeepPartial<U>[]
    : T extends object
      ? Identity<{ [K in keyof T]?: DeepPartial<T[K]> }>
      : T;

/**
 * Replaces property K in T with type R.
 * @example
 * type Original = { a: string; b: Date; }
 * type Updated = Replace<Original, "b", string>
 * // Result: { a: string, b: string }
 */
export type Replace<
  TOriginal,
  Key extends keyof TOriginal,
  TReplace,
> = Identity<Omit<TOriginal, Key> & { [P in Key]: TReplace }>;

/**
 * Replaces multiple properties in T with the types specified in the Replacements object.
 *
 * @example
 * type Original = { a: string; b: number; c: boolean };
 * type Updated = ReplaceMultiple<Original, { a: number; c: string }>;
 * // Result: { a: number; b: number; c: string }
 */
export type ReplaceMultiple<
  TOriginal,
  Replacements extends Partial<Record<keyof TOriginal, any>>,
> = Identity<Omit<TOriginal, keyof Replacements> & Replacements>;

/// A type for UUIDs
export type UUID = ReturnType<typeof crypto.randomUUID>;

export type AuditFields = {
  /// when the record was created
  createdAt: number;

  /// when the record was updated, if it has been
  updatedAt: number | null;

  /// when the record was deleted (soft-delete)
  deletedAt: number | null;
};
