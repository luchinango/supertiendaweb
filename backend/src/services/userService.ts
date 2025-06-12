import {PrismaClient, UserStatus, EmployeeStatus, Gender} from '../../prisma/generated';
import bcrypt from 'bcryptjs';
import {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UserFilters,
  UserListResponse,
  UserStats,
  ChangeUserPasswordRequest,
  ResetUserPasswordRequest
} from '../types/userTypes';

const prisma = new PrismaClient();

export class UserService {
  /**
   * Crear un nuevo usuario
   */
  async createUser(data: CreateUserRequest): Promise<User> {
    try {
      const existingUser = await prisma.user.findUnique({
        where: {username: data.username}
      });

      if (existingUser) {
        throw new Error('El nombre de usuario ya existe');
      }

      const role = await prisma.role.findUnique({
        where: {id: data.roleId}
      });

      if (!role) {
        throw new Error('El rol especificado no existe');
      }

      const passwordHash = await bcrypt.hash(data.password, 12);

      const user = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            username: data.username,
            passwordHash,
            phone: data.phone,
            status: data.status || 'PENDING_VERIFICATION',
            roleId: data.roleId
          },
          include: {
            role: true,
            employee: true
          }
        });

        if (data.employee) {
          const employee = await tx.employee.create({
            data: {
              ...data.employee,
              userId: newUser.id
            }
          });

          return await tx.user.findUnique({
            where: {id: newUser.id},
            include: {
              role: true,
              employee: true
            }
          });
        }

        return newUser;
      });

      return user as User;
    } catch (error) {
      throw new Error(`Error al crear usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Obtener usuario por ID
   */
  async getUserById(id: number): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: {id},
        include: {
          role: true,
          employee: true
        }
      });

      return user as User | null;
    } catch (error) {
      throw new Error(`Error al obtener usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Obtener usuario por username
   */
  async getUserByUsername(username: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: {username},
        include: {
          role: true,
          employee: true
        }
      });

      return user as User | null;
    } catch (error) {
      throw new Error(`Error al obtener usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Obtener lista de usuarios con filtros y paginación
   */
  async getUsers(filters: UserFilters = {}): Promise<UserListResponse> {
    try {
      const {
        status,
        roleId,
        businessId,
        search,
        page = 1,
        limit = 10
      } = filters;

      const skip = (page - 1) * limit;

      const where: any = {};

      if (status) {
        where.status = status;
      }

      if (roleId) {
        where.roleId = roleId;
      }

      if (businessId) {
        where.employee = {
          businessId: businessId
        };
      }

      if (search) {
        where.OR = [
          {username: {contains: search, mode: 'insensitive'}},
          {
            employee: {
              OR: [
                {firstName: {contains: search, mode: 'insensitive'}},
                {lastName: {contains: search, mode: 'insensitive'}}
              ]
            }
          }
        ];
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          include: {
            role: true,
            employee: true
          },
          skip,
          take: limit,
          orderBy: {createdAt: 'desc'}
        }),
        prisma.user.count({where})
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        users: users as User[],
        total,
        page,
        totalPages,
        limit
      };
    } catch (error) {
      throw new Error(`Error al obtener usuarios: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Actualizar usuario
   */
  async updateUser(id: number, data: UpdateUserRequest): Promise<User> {
    try {
      const existingUser = await prisma.user.findUnique({
        where: {id},
        include: {employee: true}
      });

      if (!existingUser) {
        throw new Error('Usuario no encontrado');
      }

      if (data.roleId) {
        const role = await prisma.role.findUnique({
          where: {id: data.roleId}
        });

        if (!role) {
          throw new Error('El rol especificado no existe');
        }
      }

      const user = await prisma.$transaction(async (tx) => {
        const updatedUser = await tx.user.update({
          where: {id},
          data: {
            phone: data.phone,
            roleId: data.roleId,
            status: data.status,
            updatedAt: new Date()
          },
          include: {
            role: true,
            employee: true
          }
        });

        if (data.employee && existingUser.employee) {
          await tx.employee.update({
            where: {id: existingUser.employee.id},
            data: data.employee
          });

          return await tx.user.findUnique({
            where: {id},
            include: {
              role: true,
              employee: true
            }
          });
        }

        return updatedUser;
      });

      return user as User;
    } catch (error) {
      throw new Error(`Error al actualizar usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Eliminar usuario (soft delete)
   */
  async deleteUser(id: number): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: {id},
        include: {employee: true}
      });

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: {id},
          data: {status: UserStatus.INACTIVE}
        });

        if (user.employee) {
          await tx.employee.update({
            where: {id: user.employee.id},
            data: {status: EmployeeStatus.ON_LEAVE}
          });
        }
      });
    } catch (error) {
      throw new Error(`Error al eliminar usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Cambiar contraseña del usuario
   */
  async changePassword(id: number, data: ChangeUserPasswordRequest): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: {id}
      });

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      const isValidPassword = await bcrypt.compare(data.currentPassword, user.passwordHash);
      if (!isValidPassword) {
        throw new Error('La contraseña actual es incorrecta');
      }

      const newPasswordHash = await bcrypt.hash(data.newPassword, 12);

      await prisma.user.update({
        where: {id},
        data: {passwordHash: newPasswordHash}
      });
    } catch (error) {
      throw new Error(`Error al cambiar contraseña: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Resetear contraseña del usuario (para administradores)
   */
  async resetPassword(id: number, data: ResetUserPasswordRequest): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: {id}
      });

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      const newPasswordHash = await bcrypt.hash(data.newPassword, 12);

      await prisma.user.update({
        where: {id},
        data: {passwordHash: newPasswordHash}
      });
    } catch (error) {
      throw new Error(`Error al resetear contraseña: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Actualizar último login
   */
  async updateLastLogin(id: number): Promise<void> {
    try {
      await prisma.user.update({
        where: {id},
        data: {lastLogin: new Date()}
      });
    } catch (error) {
      throw new Error(`Error al actualizar último login: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Obtener estadísticas de usuarios
   */
  async getUserStats(): Promise<UserStats> {
    try {
      const [
        total,
        active,
        inactive,
        suspended,
        pendingVerification,
        roles,
        businesses
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({where: {status: 'ACTIVE'}}),
        prisma.user.count({where: {status: 'INACTIVE'}}),
        prisma.user.count({where: {status: 'SUSPENDED'}}),
        prisma.user.count({where: {status: 'PENDING_VERIFICATION'}}),
        prisma.role.findMany({
          include: {
            _count: {
              select: {users: true}
            }
          }
        }),
        prisma.business.findMany({
          include: {
            _count: {
              select: {employees: true}
            }
          }
        })
      ]);

      return {
        total,
        active,
        inactive,
        suspended,
        pendingVerification,
        byRole: roles.map(role => ({
          roleName: role.name,
          count: role._count.users
        })),
        byBusiness: businesses.map(business => ({
          businessName: business.name,
          count: business._count.employees
        }))
      };
    } catch (error) {
      throw new Error(`Error al obtener estadísticas: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Verificar si el usuario existe
   */
  async userExists(id: number): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: {id},
        select: {id: true}
      });
      return !!user;
    } catch (error) {
      return false;
    }
  }

  /**
   * Verificar si el username está disponible
   */
  async isUsernameAvailable(username: string, excludeId?: number): Promise<boolean> {
    try {
      const where: any = {username};
      if (excludeId) {
        where.id = {not: excludeId};
      }

      const user = await prisma.user.findFirst({
        where,
        select: {id: true}
      });
      return !user;
    } catch (error) {
      return false;
    }
  }
}
