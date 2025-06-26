import { PrismaClient, User, Role } from '../../prisma/generated';
import { CreateUserRequest, UpdateUserRequest, UserResponse, UserListResponse } from '../types/api';
import { mapUserToUserResponse, mapUsersToUserListResponse } from '../mappers/userMappers';
import { NotFoundError, DatabaseError } from '../errors';
import logger from '../utils/logger';
import { IUserRepository } from '../interfaces/repositories/IUserRepository';

export class UserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: any): Promise<User> {
    try {
      logger.info('Creating user in repository', { username: data.username });

      return await this.prisma.user.create({
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
      }) as User;
    } catch (error) {
      logger.error('Error creating user in repository', { error, data });
      throw new DatabaseError(`Error al crear usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async findById(id: number): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({
        where: { id },
        include: {
          role: true,
          employee: true,
        },
      }) as User | null;
    } catch (error) {
      logger.error('Error finding user by ID in repository', { error, id });
      throw new DatabaseError(`Error al buscar usuario por ID: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async findByUsername(username: string): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({
        where: { username },
        include: {
          role: true,
          employee: true,
        },
      }) as User | null;
    } catch (error) {
      logger.error('Error finding user by username in repository', { error, username });
      throw new DatabaseError(`Error al buscar usuario por username: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async update(id: number, data: Partial<any>): Promise<User> {
    try {
      logger.info('Updating user in repository', { id, data });

      return await this.prisma.user.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
        include: {
          role: true,
          employee: true,
        },
      }) as User;
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
  }): Promise<User[]> {
    try {
      const defaultInclude = {
        role: true,
        employee: true,
      };

      return await this.prisma.user.findMany({
        ...options,
        include: options.include || defaultInclude,
      }) as any;
    } catch (error) {
      logger.error('Error finding many users in repository', { error, options });
      throw new DatabaseError(`Error al buscar usuarios: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
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
