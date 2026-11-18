import prisma from '../config/prisma';
import {EmployeeStatus, Gender} from '../../generated';
import {NotFoundError} from '../errors';

interface CreateEmployeeData {
  firstName: string;
  lastName?: string;
  position?: string;
  startDate: Date;
  status: EmployeeStatus;
  gender: Gender;
  birthDate?: Date;
  email: string;
  address: string;
  mobilePhone: string;
  userId: number;
  /** Obligatorio tras P1-A: sin @default(1) en businessId */
  businessId: number;
}

interface UpdateEmployeeData {
  firstName?: string;
  lastName?: string;
  position?: string;
  status?: EmployeeStatus;
  gender?: Gender;
  birthDate?: Date;
  email?: string;
  address?: string;
  mobilePhone?: string;
  userId?: number;
}

class EmployeeService {
  async create(data: CreateEmployeeData) {
    const existingEmployee = await prisma.employee.findFirst({
      where: {email: data.email}
    });

    if (existingEmployee) {
      throw new Error('Ya existe un empleado con este email');
    }

    if (data.userId) {
      const user = await prisma.user.findUnique({
        where: {id: data.userId}
      });

      if (!user) {
        throw new NotFoundError('Usuario no encontrado');
      }

      const existingUserEmployee = await prisma.employee.findUnique({
        where: {userId: data.userId}
      });

      if (existingUserEmployee) {
        throw new Error('El usuario ya tiene un empleado asociado');
      }
    }

    return prisma.employee.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName || '',
        position: data.position || '',
        startDate: data.startDate,
        status: data.status,
        gender: data.gender || 'UNSPECIFIED',
        birthDate: data.birthDate,
        email: data.email,
        address: data.address,
        phone: data.mobilePhone,
        userId: data.userId,
        businessId: data.businessId,
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

  async update(id: number, businessId: number, data: UpdateEmployeeData) {
    const employee = await prisma.employee.findFirst({
      where: {id, businessId}
    });

    if (!employee) {
      throw new NotFoundError('Empleado no encontrado');
    }

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

    if (data.userId && data.userId !== employee.userId) {
      const user = await prisma.user.findUnique({
        where: {id: data.userId}
      });

      if (!user) {
        throw new NotFoundError('Usuario no encontrado');
      }

      const existingUserEmployee = await prisma.employee.findFirst({
        where: {
          userId: data.userId,
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

  async getById(id: number, businessId: number) {
    const employee = await prisma.employee.findFirst({
      where: {id, businessId},
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

  async getAll(
    businessId: number,
    filters?: {
      status?: EmployeeStatus;
      gender?: Gender;
      search?: string;
    }
  ) {
    const where = {
      businessId,
      ...(filters?.status && {status: filters.status}),
      ...(filters?.gender && {gender: filters.gender}),
      ...(filters?.search && {
        OR: [
          {firstName: {contains: filters.search}},
          {lastName: {contains: filters.search}},
          {email: {contains: filters.search}},
          {phone: {contains: filters.search}}
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
        {firstName: 'asc'},
        {lastName: 'asc'}
      ]
    });
  }

  async delete(id: number, businessId: number) {
    const employee = await prisma.employee.findFirst({
      where: {id, businessId}
    });

    if (!employee) {
      throw new NotFoundError('Empleado no encontrado');
    }

    return prisma.employee.update({
      where: {id},
      data: {
        status: 'TERMINATED'
      }
    });
  }

  async getByUserId(userId: number, businessId: number) {
    const employee = await prisma.employee.findFirst({
      where: {userId, businessId},
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
