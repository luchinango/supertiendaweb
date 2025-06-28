import { fetcher } from './fetcher';
import type { NewPaginatedResponse, PaginationOptions, CrudResponse } from '@/types/Api';

/**
 * Construye query string para paginación
 */
export function buildPaginationQuery(options: PaginationOptions = {}): string {
  const params = new URLSearchParams();

  if (options.page) params.append('page', options.page.toString());
  if (options.limit) params.append('limit', options.limit.toString());
  if (options.sort) params.append('sort', options.sort);
  if (options.order) params.append('order', options.order);
  if (options.search) params.append('search', options.search);

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Servicio base para endpoints paginados - REUTILIZABLE para todos los servicios
 */
export class PaginatedService<T> {
  constructor(private baseUrl: string) {}

  async getList(options: PaginationOptions = {}): Promise<NewPaginatedResponse<T>> {
    const query = buildPaginationQuery(options);
    return fetcher<NewPaginatedResponse<T>>(`${this.baseUrl}${query}`);
  }

  async getAll(): Promise<T[]> {
    const response = await this.getList({ limit: 1000 });
    return response.data;
  }

  async getById(id: number): Promise<T> {
    return fetcher<T>(`${this.baseUrl}/${id}`);
  }

  async create(data: Partial<T>): Promise<T> {
    const response = await fetcher<CrudResponse<T>>(this.baseUrl, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async update(id: number, data: Partial<T>): Promise<T> {
    const response = await fetcher<CrudResponse<T>>(`${this.baseUrl}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await fetcher<void>(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });
  }
}
