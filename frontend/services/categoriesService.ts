import {fetcher} from "@/lib/fetcher";
import {Category} from "@/types/Category";

const BASE_URL = "/api/categories";

//export const getCategories = () => fetcher<Category[]>(BASE_URL);
export const getCategories = async (): Promise<Category[]> => {
  const categories = await fetcher<Category[]>(BASE_URL);
  return [{id: 0, name: "Todos", is_active: true}, ...categories];
};

export const getCategoryById = (id: number) => fetcher<Category>(`${BASE_URL}/${id}`);

export const createCategory = (category: Partial<Category>) =>
  fetcher<Category>(BASE_URL, {
    method: "POST",
    body: JSON.stringify(category),
  });

export const updateCategory = (id: number, category: Partial<Category>) =>
  fetcher<Category>(`${BASE_URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(category),
  });

export const deleteCategory = (id: number) =>
  fetcher<void>(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
