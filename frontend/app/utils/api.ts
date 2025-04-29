import type EmployeeDto  from "../types/EmployeeDto";

export const swrFetcher = (url: string) =>
  fetch(url, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  }).then((res) => {
    if (!res.ok) throw new Error(res.statusText);
    return res.json();
  });

/*
export const fetchEmployees = async (url: string): Promise<EmployeeDto[]> => {
  const data = await swrFetcher(url);
  return data.map((p: any) => ({
    id: p.id,
    firstName: p.firstname,
    lastName: p.lastname,
    position: p.position,
    salary: p.salary,
    startDate: p.start_date,
    imagen: "/placeholder.svg",
  }));
};


export const updateEmployee = async (
    id: Number,
    employeeData: Partial<EmployeeDto>
): Promise<EmployeeDto> => {
    const response = await fetch(`/api/employees/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            firstname: employeeData.firstName,
            lastname: employeeData.lastName,
            position: employeeData.position,
            salary: employeeData.salary,
            start_date: employeeData.startDate,
        }),
    });

    if (!response.ok) throw new Error('Error al actualizar empleado');
    return response.json();
};

export const createFetcher = (headers?: Record<string, string>) =>
    (url: string) => fetch(url, { headers }).then(res => res.json());

  const { data } = useSWR("/api/secure-data", createFetcher({
    Authorization: "Bearer token123"
  }));
*/