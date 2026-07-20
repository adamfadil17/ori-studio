import { PaginationMeta } from "@/lib/api-response";

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export function getPrismaPagination(page: number, limit: number) {
  const skip = (page - 1) * limit;
  return { skip, take: limit };
}

export function buildPaginationMeta(
  page: number,
  limit: number,
  total: number,
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

export async function paginateQuery<T>(
  countFn: () => Promise<number>,
  findFn: (skip: number, take: number) => Promise<T[]>,
  page: number,
  limit: number,
): Promise<PaginatedResult<T>> {
  const { skip, take } = getPrismaPagination(page, limit);
  const [total, data] = await Promise.all([countFn(), findFn(skip, take)]);
  return { data, meta: buildPaginationMeta(page, limit, total) };
}
