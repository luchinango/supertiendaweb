import {fetcher} from "@/lib/fetcher";
import {Product} from "@/types/Product";

const BASE_URL = "/api/products";

export const getProducts = () => fetcher<Product[]>(BASE_URL);

export const getProductsByCategory = (categoryId: number) => fetcher<Product[]>(`${BASE_URL}/category/${categoryId}`);

export const getProductById = (id: number) => fetcher<Product>(`${BASE_URL}/${id}`);

export const createProduct = (product: Partial<Product>) =>
  fetcher<Product>(BASE_URL, {
    method: "POST",
    body: JSON.stringify(product),
  });

export const updateProduct = (id: number, product: Partial<Product>) =>
  fetcher<Product>(`${BASE_URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(product),
  });

export const deleteProduct = (id: number) =>
  fetcher<void>(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });