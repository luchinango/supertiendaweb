import useSWR from "swr";
import type {Customer} from "@/types/Customer";
import {getCustomers, createCustomer, updateCustomer, deleteCustomer} from "@/services/customersService";

export function useCustomers() {
  const {data, error, isLoading, mutate} = useSWR<Customer[]>("customers", getCustomers);

  const addCustomer = async (newCustomer: Partial<Customer>) => {
    try {
      const created = await createCustomer(newCustomer);
      mutate((customers) => (customers ? [...customers, created] : [created]), false);
    } catch (error) {
      console.error('Error adding customer:', error);
      throw error;
    }
  };

  const editCustomer = async (id: number, updatedData: Partial<Customer>) => {
    try {
      const optimisticData = data?.map(cust => cust.id === id ? {...cust, ...updatedData} : cust);
      mutate(optimisticData, false);

      await updateCustomer(id, updatedData);

      mutate();
    } catch (error) {
      console.error('Error editing customer:', error);
      mutate();
    }
  };

  const removeCustomer = async (id: number) => {
    try {
      const optimisticData = data?.filter(cust => cust.id !== id);
      mutate(optimisticData, false);

      await deleteCustomer(id);

      mutate();
    } catch (error) {
      console.error('Error deleting customer:', error);
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
