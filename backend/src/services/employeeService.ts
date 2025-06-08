import prisma from '../config/prisma';
import {EmployeeStatus, Gender} from '@prisma/client';
import {NotFoundError} from '../errors';

interface CreateEmployeeData {
  first_name: string;
  last_name?: string;
  position?: string;
  start_date: Date;
  status: EmployeeStatus;
  gender: Gender;
  birth_date?: Date;
  email: string;
  address: string;
  mobile_phone: string;
  user_id?: number;
}

interface UpdateEmployeeData {
  first_name?: string;
  last_name?: string;
  position?: string;
  status?: EmployeeStatus;
  gender?: Gender;
  birth_date?: Date;
  email?: string;
  address?: string;
  mobile_phone?: string;
  user_id?: number;
}

class EmployeeService {
  async create(data: CreateEmployeeData) {
    // Verificar si ya existe un empleado con el mismo email
    const existingEmployee = await prisma.employee.findFirst({
      where: {email: data.email}
    });

    if (existingEmployee) {
      throw new Error('Ya existe un empleado con este email');
    }

    // Si se proporciona user_id, verificar que el usuario existe
    if (data.user_id) {
      const user = await prisma.user.findUnique({
        where: {id: data.user_id}
      });

      if (!user) {
        throw new NotFoundError('Usuario no encontrado');
      }

      // Verificar que el usuario no tenga ya un empleado asociado
      const existingUserEmployee = await prisma.employee.findUnique({
        where: {user_id: data.user_id}
      });

      if (existingUserEmployee) {
        throw new Error('El usuario ya tiene un empleado asociado');
      }
    }

    return prisma.employee.create({
      data: {
        ...data,
        last_name: data.last_name || '',
        position: data.position || '',
        gender: data.gender || 'UNSPECIFIED'
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            role: {
              select: {
                code: true,
                name: true
              }
            }
          }
        }
      }
    });
  }

  async update(id: number, data: UpdateEmployeeData) {
    const employee = await prisma.employee.findUnique({
      where: {id}
    });

    if (!employee) {
      throw new NotFoundError('Empleado no encontrado');
    }

    // Si se está actualizando el email, verificar que no exista otro empleado con ese email
    if (data.email && data.email !== employee.email) {
      const existingEmployee = await prisma.employee.findFirst({
        where: {
          email: data.email,
          id: {not: id}
        }
      });

      if (existingEmployee) {
        throw new Error('Ya existe un empleado con este email');
      }
    }

    // Si se está actualizando el user_id, verificar que el usuario existe y no tiene otro empleado
    if (data.user_id && data.user_id !== employee.user_id) {
      const user = await prisma.user.findUnique({
        where: {id: data.user_id}
      });

      if (!user) {
        throw new NotFoundError('Usuario no encontrado');
      }

      const existingUserEmployee = await prisma.employee.findFirst({
        where: {
          user_id: data.user_id,
          id: {not: id}
        }
      });

      if (existingUserEmployee) {
        throw new Error('El usuario ya tiene un empleado asociado');
      }
    }

    return prisma.employee.update({
      where: {id},
      data,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            role: {
              select: {
                code: true,
                name: true
              }
            }
          }
        }
      }
    });
  }

  async getById(id: number) {
    const employee = await prisma.employee.findUnique({
      where: {id},
      include: {
        user: {
          select: {
            id: true,
            username: true,
            role: {
              select: {
                code: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (!employee) {
      throw new NotFoundError('Empleado no encontrado');
    }

    return employee;
  }

  async getAll(filters?: {
    status?: EmployeeStatus;
    gender?: Gender;
    search?: string;
  }) {
    const where = {
      ...(filters?.status && {status: filters.status}),
      ...(filters?.gender && {gender: filters.gender}),
      ...(filters?.search && {
        OR: [
          {first_name: {contains: filters.search}},
          {last_name: {contains: filters.search}},
          {email: {contains: filters.search}},
          {mobile_phone: {contains: filters.search}}
        ]
      })
    };

    return prisma.employee.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            role: {
              select: {
                code: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: [
        {status: 'asc'},
        {first_name: 'asc'},
        {last_name: 'asc'}
      ]
    });
  }

  async delete(id: number) {
    const employee = await prisma.employee.findUnique({
      where: {id}
    });

    if (!employee) {
      throw new NotFoundError('Empleado no encontrado');
    }

    // En lugar de eliminar, cambiamos el estado a TERMINATED
    return prisma.employee.update({
      where: {id},
      data: {
        status: 'TERMINATED'
      }
    });
  }

  async getByUserId(userId: number) {
    const employee = await prisma.employee.findUnique({
      where: {user_id: userId},
      include: {
        user: {
          select: {
            id: true,
            username: true,
            role: {
              select: {
                code: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (!employee) {
      throw new NotFoundError('Empleado no encontrado');
    }

    return employee;
  }
}

export const employeeService = new EmployeeService();
export default employeeService;