export type ApiFieldErrors = Record<string, string[]>;

export interface ApiSuccessResponse<TData> {
  message: string;
  data: TData;
}

export interface ApiMessageResponse {
  message: string;
}

export interface ApiValidationErrorResponse {
  message: string;
  errors: ApiFieldErrors;
}

export interface ApiErrorResponse {
  message: string;
}

export interface ApiPaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface ApiPaginationLinks {
  first: string | null;
  last: string | null;
  previous: string | null;
  next: string | null;
}

export interface ApiPaginatedResponse<TData> {
  message: string;
  data: TData[];
  meta: ApiPaginationMeta;
  links: ApiPaginationLinks;
}
