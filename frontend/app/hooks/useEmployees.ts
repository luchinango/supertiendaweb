import EmployeeDto from "../types/EmployeeDto";
import { fetchEmployees, updateEmployee } from "../utils/api";
import useSWR from "swr";

export function useEmployees() {
  const { data, error, isLoading, mutate } = useSWR<EmployeeDto[]>(
    "/api/employees",
    fetchEmployees
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
