
import { v4 as uuidv4 } from 'uuid';
import { ApiErrorResponse, ApiListResponse, ApiMeta, ApiResponse } from '../types/response.types';


export function buildSuccessResponse<T>(
  data: T,
  path: string,
  version = 'v1',
): ApiResponse<T> {
  return {
    ok: true,
    data,
    meta: buildMeta(path, version),
  };
}

export function buildListResponse<T>(
  data: T[],
  total: number,
  page: number,
  per_page: number,
  filters: any,
  path: string,
  version = 'v1',
): ApiListResponse<T> {
  return {
    ok: true,
    data,
    meta: {
      ...buildMeta(path, version),
      paging: {
        page,
        per_page,
        total_items: total,
        total_pages: Math.ceil(total / per_page),
      },
      filter: filters,
    },
  };
}

export function buildErrorResponse(
  code: string,
  message: string,
  path: string,
  version = 'v1',
): ApiErrorResponse {
  return {
    ok: false,
    data: null,
    error: { code, message },
    meta: buildMeta(path, version),
  };
}

export function  buildMeta(path: string, version = 'v1'): ApiMeta {
  return {
    requestId: uuidv4(),
    timestamp: new Date().toISOString(),
    path,
    version,
  };
}

export function buildApiErrorResponse(
  code: string,
  message: string,
  details?: any,
  meta?: Partial<ApiMeta>,
): ApiErrorResponse {
  return {
    ok: false,
    error: { code, message, details },
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };
}