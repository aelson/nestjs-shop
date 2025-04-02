import { PaginatedResult, PaginationMeta } from '../interfaces/paginated-result.interface';

export class PaginationHelper {
  static paginate<T>(
    items: T[],
    totalItems: number,
    page: number,
    limit: number,
  ): PaginatedResult<T> {
    const totalPages = Math.ceil(totalItems / limit);

    const meta: PaginationMeta = {
      totalItems,
      itemCount: items.length,
      itemsPerPage: limit,
      totalPages,
      currentPage: page,
    };

    return {
      items,
      meta,
    };
  }
}
