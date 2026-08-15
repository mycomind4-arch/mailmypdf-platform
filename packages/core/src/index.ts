export type Brand<T, B extends string> = T & { readonly __brand: B };

export type PlatformId = Brand<string, "PlatformId">;

export function createId(value: string): PlatformId {
  if (!value.trim()) throw new Error("Platform IDs cannot be empty");
  return value as PlatformId;
}

export type Result<T, E = Error> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });

export type Confidence = number & { readonly __brand: "Confidence" };

export function confidence(value: number): Confidence {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new Error("Confidence must be between 0 and 1");
  }
  return value as Confidence;
}
