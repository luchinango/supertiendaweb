import { User } from '../../types/userTypes';
import { CreateUserRequest, UpdateUserRequest } from '../../types/userTypes';

export interface IUserRepository {
  create(data: CreateUserRequest): Promise<User>;
  findById(id: number): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  update(id: number, data: Partial<UpdateUserRequest>): Promise<User>;
  delete(id: number): Promise<void>;

  findMany(options: {
    where?: any;
    include?: any;
    orderBy?: any;
    skip?: number;
    take?: number;
  }): Promise<User[]>;

  count(where?: any): Promise<number>;
  exists(id: number): Promise<boolean>;

  updateLastLogin(id: number): Promise<void>;
  updatePassword(id: number, passwordHash: string): Promise<void>;
  checkUsernameExists(username: string, excludeId?: number): Promise<boolean>;
}
