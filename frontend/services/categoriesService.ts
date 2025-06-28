import { PaginatedService } from "@/lib/api-utils";
import type { Category } from "@/types/Category";

class CategoriesService extends PaginatedService<Category> {
  constructor() {
    super("/categories");
  }

  async getAllWithDefault(): Promise<Category[]> {
    const categories = await this.getAll();
    return [{ id: 0, name: "Todos", is_active: true }, ...categories];
  }
}

const categoriesService = new CategoriesService();

export const getCategories = () => categoriesService.getAllWithDefault();
export const getCategoriesPaginated = (page: number = 1, limit: number = 10) =>
  categoriesService.getList({ page, limit });
export const getCategoryById = (id: number) => categoriesService.getById(id);
export const createCategory = (category: Partial<Category>) => categoriesService.create(category);
export const updateCategory = (id: number, category: Partial<Category>) =>
  categoriesService.update(id, category);
export const deleteCategory = (id: number) => categoriesService.delete(id);

export { categoriesService };
