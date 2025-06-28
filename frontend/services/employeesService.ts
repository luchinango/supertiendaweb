import { PaginatedService } from "@/lib/api-utils";
import type { Employee } from "@/types/Employee";

class EmployeesService extends PaginatedService<Employee> {
  constructor() {
    super("/employees");
  }
}

const employeesService = new EmployeesService();

export const getEmployees = () => employeesService.getAll();
export const getEmployeesPaginated = (page: number = 1, limit: number = 10) =>
  employeesService.getList({ page, limit });
export const getEmployeeById = (id: number) => employeesService.getById(id);
export const createEmployee = (employee: Partial<Employee>) => employeesService.create(employee);
export const updateEmployee = (id: number, employee: Partial<Employee>) =>
  employeesService.update(id, employee);
export const deleteEmployee = (id: number) => employeesService.delete(id);

export { employeesService };
