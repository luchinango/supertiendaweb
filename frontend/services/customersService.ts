import { fetcher } from "@/lib/fetcher";
import type {Customer} from "@/types/Customer";

const BASE_URL = "/api/customers";

export const getCustomers = () => fetcher<Customer[]>(BASE_URL);

export const getCustomerById = (id: number) => fetcher<Customer>(`${BASE_URL}/${id}`);

export const createCustomer = (customer: Partial<Customer>) =>
  fetcher<Customer>(BASE_URL, {
    method: "POST",
    body: JSON.stringify(customer),
  });

export const updateCustomer = (id: number, customer: Partial<Customer>) =>
  fetcher<Customer>(`${BASE_URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(customer),
  });

export const deleteCustomer = (id: number) =>
  fetcher<void>(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
