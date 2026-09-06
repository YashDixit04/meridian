type MongoDocument<T extends Record<string, unknown>> = T & { _id?: unknown };

export function stripMongoId<T extends Record<string, unknown>>(
  doc: MongoDocument<T> | null | undefined,
): T | null {
  if (!doc) {
    return null;
  }

  const { _id, ...plain } = doc;
  void _id;
  return plain as T;
}

export function stripMongoIds<T extends Record<string, unknown>>(
  docs: Array<MongoDocument<T>>,
): T[] {
  return docs
    .map((doc) => stripMongoId(doc))
    .filter((doc): doc is T => doc !== null);
}

export function ensureDate(value: unknown, fallback: Date = new Date()): Date {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return fallback;
}
