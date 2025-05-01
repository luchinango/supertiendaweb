import useSWR from "swr";
import {Product} from "@/types/Product";
import {
  getProducts,
  getProductsByCategory,
  createProduct,
  updateProduct,
  deleteProduct
} from "@/services/productsService";

export function useProducts(categoryId?: number) {
  console.log("categoryId", categoryId);
  const key = categoryId && categoryId != 0 ? `/api/products/category/${categoryId}` : "/api/products";
  const fetcherFn = categoryId && categoryId != 0 ? () => getProductsByCategory(categoryId) : getProducts;

  const {data, error, isLoading, mutate} = useSWR<Product[]>(key, fetcherFn);

  const addProduct = async (product: Partial<Product>) => {
    try {
      const created = await createProduct(product);
      mutate((list) => (list ? [...list, created] : [created]), false);
    } catch (error) {
      console.error("Error adding product:", error);
      throw error;
    }
  };

  const editProduct = async (id: number, updatedData: Partial<Product>) => {
    try {
      const optimistic = data?.map((p) =>
        p.id === id ? {...p, ...updatedData} : p
      );
      mutate(optimistic, false);
      await updateProduct(id, updatedData);
      mutate();
    } catch (error) {
      console.error("Error updating product:", error);
      mutate();
    }
  };

  const removeProduct = async (id: number) => {
    try {
      const optimistic = data?.filter((p) => p.id !== id);
      mutate(optimistic, false);
      await deleteProduct(id);
      mutate();
    } catch (error) {
      console.error("Error deleting product:", error);
      mutate();
    }
  };

  return {
    products: data || [],
    error,
    isLoading,
    mutate,
    addProduct,
    editProduct,
    removeProduct,
  };
}
