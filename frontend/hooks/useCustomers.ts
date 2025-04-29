import useSWR from "swr";
import {Customer} from "@/types/Customer";
import {getCustomers, createCustomer, updateCustomer, deleteCustomer} from "@/services/customersService";

export function useCustomers() {
  const {data, error, isLoading, mutate} = useSWR<Customer[]>("/api/customers", getCustomers);

  const addCustomer = async (customer: Partial<Customer>) => {
    try {
      const created = await createCustomer(customer);
      mutate((list) => (list ? [...list, created] : [created]), false);
    } catch (error) {
      console.error("Error adding customer:", error);
      throw error;
    }
  };

  const editCustomer = async (id: number, updatedData: Partial<Customer>) => {
    try {
      const optimisticData = data?.map(c => c.id === id ? {...c, ...updatedData} : c);
      mutate(optimisticData, false);

      await updateCustomer(id, updatedData);

      mutate();
    } catch (error) {
      console.error("Error editing customer:", error);
      mutate();
    }
  };

  const removeCustomer = async (id: number) => {
    try {
      const optimisticData = data?.filter(c => c.id !== id);
      mutate(optimisticData, false);

      await deleteCustomer(id);

      mutate();
    } catch (error) {
      console.error("Error deleting customer:", error);
      mutate();
    }
  };

  return {
    customers: data || [],
    error,
    isLoading,
    mutate,
    addCustomer,
    editCustomer,
    removeCustomer,
  };
}
