import { HttpParams } from '@angular/common/http';

export interface PaginationParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
}

export function getPaginationParams(params: PaginationParams = {}): HttpParams {
  let httpParams = new HttpParams();
  
  if (params.page !== undefined) {
    httpParams = httpParams.set('page', params.page.toString());
  }
  
  if (params.per_page !== undefined) {
    httpParams = httpParams.set('per_page', params.per_page.toString());
  }
  
  if (params.sort_by) {
    httpParams = httpParams.set('sort_by', params.sort_by);
  }
  
  if (params.sort_dir) {
    httpParams = httpParams.set('sort_dir', params.sort_dir);
  }
  
  return httpParams;
}
