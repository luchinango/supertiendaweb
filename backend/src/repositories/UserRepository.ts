import { PrismaClient, User, Role } from '../../prisma/generated';
import { CreateUserRequest, UpdateUserRequest, UserResponse, UserListResponse } from '../types/api';
import { User as UserType } from '../types/userTypes';
import { mapUserToUserResponse, mapUsersToUserListResponse } from '../mappers/userMappers';
import { NotFoundError, DatabaseError } from '../errors';
import logger from '../utils/logger';
import { IUserRepository } from '../interfaces/repositories/IUserRepository';

export class UserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: any): Promise<UserType> {
    try {
      logger.info('Creating user in repository', { username: data.username });

      const user = await this.prisma.user.create({
        data: {
          username: data.username,
          passwordHash: data.passwordHash,
          phone: data.phone,
          status: data.status,
          roleId: data.roleId,
        },
        include: {
          role: true,
          employee: true,
        },
      });

      // @ts-ignore - Prisma types are complex with relations, using manual mapping
      return this.mapPrismaUserToUserType(user);
    } catch (error) {
      logger.error('Error creating user in repository', { error, data });
      throw new DatabaseError(`Error al crear usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async findById(id: number): Promise<UserType | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        include: {
          role: true,
          employee: true,
        },
      });

      // @ts-ignore - Prisma types are complex with relations, using manual mapping
      return user ? this.mapPrismaUserToUserType(user) : null;
    } catch (error) {
      logger.error('Error finding user by ID in repository', { error, id });
      throw new DatabaseError(`Error al buscar usuario por ID: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async findByUsername(username: string): Promise<UserType | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { username },
        include: {
          role: true,
          employee: true,
        },
      });

      // @ts-ignore - Prisma types are complex with relations, using manual mapping
      return user ? this.mapPrismaUserToUserType(user) : null;
    } catch (error) {
      logger.error('Error finding user by username in repository', { error, username });
      throw new DatabaseError(`Error al buscar usuario por username: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async update(id: number, data: Partial<any>): Promise<UserType> {
    try {
      logger.info('Updating user in repository', { id, data });

      const user = await this.prisma.user.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
        include: {
          role: true,
          employee: true,
        },
      });

      // @ts-ignore - Prisma types are complex with relations, using manual mapping
      return this.mapPrismaUserToUserType(user);
    } catch (error) {
      logger.error('Error updating user in repository', { error, id, data });
      throw new DatabaseError(`Error al actualizar usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async delete(id: number): Promise<void> {
    try {
      logger.info('Deleting user in repository', { id });

      await this.prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      logger.error('Error deleting user in repository', { error, id });
      throw new DatabaseError(`Error al eliminar usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async findMany(options: {
    where?: any;
    include?: any;
    orderBy?: any;
    skip?: number;
    take?: number;
  }): Promise<UserType[]> {
    try {
      const defaultInclude = {
        role: true,
        employee: true,
      };

      const users = await this.prisma.user.findMany({
        ...options,
        include: options.include || defaultInclude,
      });

      return users.map(user => this.mapPrismaUserToUserType(user));
    } catch (error) {
      logger.error('Error finding many users in repository', { error, options });
      throw new DatabaseError(`Error al buscar usuarios: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  private mapPrismaUserToUserType(user: any): UserType {
    return {
      id: user.id,
      username: user.username,
      phone: user.phone,
      status: user.status,
      roleId: user.roleId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLogin: user.lastLogin,
      role: {
        id: user.role.id,
        code: user.role.code,
        name: user.role.name,
        description: user.role.description,
      },
      employee: user.employee ? {
        id: user.employee.id,
        firstName: user.employee.firstName,
        lastName: user.employee.lastName,
        position: user.employee.position,
        department: user.employee.department,
        startDate: user.employee.startDate,
        endDate: user.employee.endDate,
        salary: user.employee.salary ? Number(user.employee.salary) : null,
        status: user.employee.status,
        gender: user.employee.gender,
        birthDate: user.employee.birthDate,
        email: user.employee.email,
        phone: user.employee.phone,
        address: user.employee.address,
        emergencyContact: user.employee.emergencyContact,
        emergencyPhone: user.employee.emergencyPhone,
        ciNumber: user.employee.ciNumber,
        businessId: user.employee.businessId,
      } : null,
    };
  }

  async count(where?: any): Promise<number> {
    try {
      return await this.prisma.user.count({ where });
    } catch (error) {
      logger.error('Error counting users in repository', { error, where });
      throw new DatabaseError(`Error al contar usuarios: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async exists(id: number): Promise<boolean> {
    try {
      const count = await this.prisma.user.count({
        where: { id },
      });
      return count > 0;
    } catch (error) {
      logger.error('Error checking user existence in repository', { error, id });
      throw new DatabaseError(`Error al verificar existencia de usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async updateLastLogin(id: number): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id },
        data: {
          lastLogin: new Date(),
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      logger.error('Error updating last login in repository', { error, id });
      throw new DatabaseError(`Error al actualizar último login: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async updatePassword(id: number, passwordHash: string): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id },
        data: {
          passwordHash,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      logger.error('Error updating password in repository', { error, id });
      throw new DatabaseError(`Error al actualizar contraseña: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async checkUsernameExists(username: string, excludeId?: number): Promise<boolean> {
    try {
      const where: any = { username };
      if (excludeId) {
        where.id = { not: excludeId };
      }

      const count = await this.prisma.user.count({ where });
      return count > 0;
    } catch (error) {
      logger.error('Error checking username existence in repository', { error, username, excludeId });
      throw new DatabaseError(`Error al verificar disponibilidad de username: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }
}
