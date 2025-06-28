import { User } from '../../types/userTypes';
import { CreateUserRequest, UpdateUserRequest } from '../../types/userTypes';

export interface IUserRepository {
  create(data: any): Promise<any>;
  findById(id: number): Promise<any>;
  findByUsername(username: string): Promise<any>;
  update(id: number, data: Partial<any>): Promise<any>;
  delete(id: number): Promise<void>;

  findMany(options: {
    where?: any;
    include?: any;
    orderBy?: any;
    skip?: number;
    take?: number;
  }): Promise<any[]>;

  count(where?: any): Promise<number>;
  exists(id: number): Promise<boolean>;

  updateLastLogin(id: number): Promise<void>;
  updatePassword(id: number, passwordHash: string): Promise<void>;
  checkUsernameExists(username: string, excludeId?: number): Promise<boolean>;
}
