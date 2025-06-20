import {fetcher} from "@/lib/fetcher";
import type {Employee} from "@/types/Employee";

const BASE_URL = "/api/employees";

export const getEmployees = () => fetcher<Employee[]>(BASE_URL);

export const getEmployeeById = (id: number) => fetcher<Employee>(`${BASE_URL}/${id}`);

export const createEmployee = (employee: Partial<Employee>) =>
  fetcher<Employee>(BASE_URL, {
    method: "POST",
    body: JSON.stringify(employee),
  });

export const updateEmployee = (id: number, employee: Partial<Employee>) =>
  fetcher<Employee>(`${BASE_URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(employee),
  });

export const deleteEmployee = (id: number) =>
  fetcher<void>(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
