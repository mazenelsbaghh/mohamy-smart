/** Standard loading state for Redux slices */
export type TLoading = 'idle' | 'pending' | 'succeeded' | 'failed';

/** Branded type for ISO 8601 date strings to prevent accidental string assignment */
export type ISODateString = string & { __brand: 'ISODate' };

/** Generic API response wrapper matching the .NET backend Result<T> pattern */
export interface ApiResponse<T> {
  succeeded: boolean;
  message: string | null;
  data: T;
  errors: string[] | null;
}

/** Paginated API response */
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}
