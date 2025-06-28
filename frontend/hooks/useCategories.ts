import useSWR from "swr";
import type {Category} from "@/types/Category";
import {
  getCategories,
  getCategoriesPaginated,
  createCategory,
  updateCategory,
  deleteCategory
} from "@/services/categoriesService";

export function useCategories() {
  const {data, error, isLoading, mutate} = useSWR<Category[]>("categories", getCategories);

  const addCategory = async (category: Partial<Category>) => {
    try {
      const created = await createCategory(category);
      mutate((list) => (list ? [...list, created] : [created]), false);
    } catch (error) {
      console.error("Error adding category:", error);
      throw error;
    }
  };

  const editCategory = async (id: number, updatedData: Partial<Category>) => {
    try {
      const optimistic = data?.map((cat) =>
        cat.id === id ? {...cat, ...updatedData} : cat
      );
      mutate(optimistic, false);
      await updateCategory(id, updatedData);
      mutate();
    } catch (error) {
      console.error("Error updating category:", error);
      mutate();
    }
  };

  const removeCategory = async (id: number) => {
    try {
      const optimistic = data?.filter((cat) => cat.id !== id);
      mutate(optimistic, false);
      await deleteCategory(id);
      mutate();
    } catch (error) {
      console.error("Error deleting category:", error);
      mutate();
    }
  };

  return {
    categories: data || [],
    error,
    isLoading,
    mutate,
    addCategory,
    editCategory,
    removeCategory,
  };
}

export function useCategoriesPaginated(page: number = 1, limit: number = 10) {
  const {data, error, isLoading, mutate} = useSWR(
    `categories-paginated-${page}-${limit}`,
    () => getCategoriesPaginated(page, limit)
  );

  return {
    response: data,
    categories: data?.data || [],
    meta: data?.meta,
    error,
    isLoading,
    mutate,
  };
}
