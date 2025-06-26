import { User } from '../../types/userTypes';
import { CreateUserRequest, UpdateUserRequest, UserStats, ChangeUserPasswordRequest, ResetUserPasswordRequest } from '../../types/userTypes';
import { PaginationParams, PaginatedResult } from '../../types/pagination';

export interface IUserService {
  createUser(data: CreateUserRequest): Promise<User>;
  getUserById(id: number): Promise<User | null>;
  getUserByUsername(username: string): Promise<User | null>;
  updateUser(id: number, data: UpdateUserRequest): Promise<User>;
  deleteUser(id: number): Promise<void>;

  findMany(params: PaginationParams, additionalFilters?: any): Promise<PaginatedResult<User>>;

  changePassword(id: number, data: ChangeUserPasswordRequest): Promise<void>;
  resetPassword(id: number, data: ResetUserPasswordRequest): Promise<void>;
  updateLastLogin(id: number): Promise<void>;
  getUserStats(): Promise<UserStats>;
  userExists(id: number): Promise<boolean>;
  isUsernameAvailable(username: string, excludeId?: number): Promise<boolean>;
}
