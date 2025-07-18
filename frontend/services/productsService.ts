import { PaginatedService, buildPaginationQuery } from "@/lib/api-utils";
import { fetcher } from "@/lib/fetcher";
import type { Product } from "@/types/Product";
import type { PaginationOptions, NewPaginatedResponse } from "@/types/Api";

class ProductsService extends PaginatedService<Product> {
  constructor() {
    super("/products");
  }

  async getByCategory(categoryId: number, options: PaginationOptions = {}): Promise<Product[]> {
    const baseQuery = buildPaginationQuery(options);
    const separator = baseQuery ? '&' : '?';
    const categoryQuery = `categoryId=${categoryId}`;
    const fullQuery = baseQuery ? `${baseQuery}&${categoryQuery}` : `?${categoryQuery}`;

    const response = await fetcher<NewPaginatedResponse<Product>>(`/products${fullQuery}`);
    return response.data;
  }

  async getPaginatedWithFilters(options: PaginationOptions & { categoryId?: number } = {}): Promise<NewPaginatedResponse<Product>> {
    const { categoryId, ...paginationOptions } = options;
    const baseQuery = buildPaginationQuery(paginationOptions);

    let fullQuery = baseQuery || '?';
    if (categoryId) {
      const separator = baseQuery ? '&' : '?';
      fullQuery = `${fullQuery}${separator}categoryId=${categoryId}`;
    }

    return await fetcher<NewPaginatedResponse<Product>>(`/products${fullQuery}`);
  }
}

const productsService = new ProductsService();

export const getProducts = () => productsService.getAll();
export const getProductsByCategory = (categoryId: number) => productsService.getByCategory(categoryId);
export const getProductsPaginated = (page: number = 1, limit: number = 10) =>
  productsService.getList({ page, limit });
export const getProductsPaginatedWithFilters = (options: PaginationOptions & { categoryId?: number } = {}) =>
  productsService.getPaginatedWithFilters(options);
export const getProductById = (id: number) => productsService.getById(id);
export const createProduct = (product: Partial<Product>) => productsService.create(product);
export const updateProduct = (id: number, product: Partial<Product>) =>
  productsService.update(id, product);
export const deleteProduct = (id: number) => productsService.delete(id);

export { productsService };
