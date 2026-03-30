export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export type CollectionResponse<T> = T[] | PaginatedResponse<T>;

export interface CollectionResult<T> {
  items: T[];
  meta: PaginationMeta | null;
}

export interface RemoteResourceState<T> {
  data: T;
  meta: PaginationMeta | null;
  loading: boolean;
  error: string | null;
  isFallback: boolean;
  isEmpty: boolean;
}
