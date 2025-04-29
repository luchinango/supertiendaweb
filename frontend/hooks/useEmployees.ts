import useSWR from "swr";
import {Employee} from "@/types/Employee";
import {getEmployees, createEmployee, updateEmployee, deleteEmployee} from "@/services/employeesService";

export function useEmployees() {
  const {data, error, isLoading, mutate} = useSWR<Employee[]>("/api/employees", getEmployees);

  const addEmployee = async (newEmployee: Partial<Employee>) => {
    try {
      const created = await createEmployee(newEmployee);
      mutate((employees) => (employees ? [...employees, created] : [created]), false); // optimista
    } catch (error) {
      console.error('Error adding employee:', error);
      throw error;
    }
  };

  const editEmployee = async (id: number, updatedData: Partial<Employee>) => {
    try {
      const optimisticData = data?.map(emp => emp.id === id ? {...emp, ...updatedData} : emp);
      mutate(optimisticData, false);

      await updateEmployee(id, updatedData);

      mutate();
    } catch (error) {
      console.error('Error editing employee:', error);
      mutate();
    }
  };

  const removeEmployee = async (id: number) => {
    try {
      const optimisticData = data?.filter(emp => emp.id !== id);
      mutate(optimisticData, false);

      await deleteEmployee(id);

      mutate();
    } catch (error) {
      console.error('Error deleting employee:', error);
      mutate();
    }
  };

  return {
    employees: data || [],
    error,
    isLoading,
    mutate,
    addEmployee,
    editEmployee,
    removeEmployee,
  };
}


/*
import EmployeeDto from "@/types/EmployeeDto";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useEmployees() {
  const { data, error, isLoading, mutate } = useSWR<EmployeeDto[]>(
    "/api/employees",
    fetcher
  );

  const editEmployee = async (id: Number, updatedData: Partial<EmployeeDto>) => {
    try {
      const optimisticData = data?.map(emp =>  emp.id === id ? { ...emp, ...updatedData } : emp);
      mutate(optimisticData, false);

      await updateEmployee(id, updatedData);

      mutate();
    } catch (error) {
      console.error('Error al editar empleado:', error);
      mutate();
    }
  };

  return {
    employees: data || [],
    error,
    isLoading,
    mutate,
    editEmployee
  };
}
*/