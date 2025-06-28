import { PaginatedService } from "@/lib/api-utils";
import type { Customer } from "@/types/Customer";

class CustomersService extends PaginatedService<Customer> {
  constructor() {
    super("/customers");
  }
}

const customersService = new CustomersService();

export const getCustomers = () => customersService.getAll();
export const getCustomersPaginated = (page: number = 1, limit: number = 10) =>
  customersService.getList({ page, limit });
export const getCustomerById = (id: number) => customersService.getById(id);
export const createCustomer = (customer: Partial<Customer>) => customersService.create(customer);
export const updateCustomer = (id: number, customer: Partial<Customer>) =>
  customersService.update(id, customer);
export const deleteCustomer = (id: number) => customersService.delete(id);

export { customersService };
