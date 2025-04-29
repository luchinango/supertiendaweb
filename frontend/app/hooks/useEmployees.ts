import EmployeeDto from "../types/EmployeeDto";
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
