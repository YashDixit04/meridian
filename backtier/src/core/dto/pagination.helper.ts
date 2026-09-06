export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/**
 * Helper to build a standard paginated result object.
 * Use this in every repository or service that supports pagination.
 *
 * @example
 * const [items, total] = await Promise.all([
 *   this.repository.findMany({ skip, take }),
 *   this.repository.count(),
 * ]);
 * return paginate(items, total, query.page, query.limit);
 */
export function paginate<T>(
  data: T[],
  total: number,
  page: number = 1,
  limit: number = 20,
): PaginatedResult<T> {
  const totalPages = Math.ceil(total / limit);
  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}
