import { PrismaClient } from '../../prisma/generated';
import prisma from '../config/prisma';

// Interfaces
import { IUserService } from '../interfaces/services/IUserService';
import { IUserRepository } from '../interfaces/repositories/IUserRepository';
import { ISupplierService } from '../interfaces/services/ISupplierService';
import { ISupplierRepository } from '../interfaces/repositories/ISupplierRepository';
import { IProductService } from '../interfaces/services/IProductService';
import { IProductRepository } from '../interfaces/repositories/IProductRepository';
import { IBusinessProductRepository } from '../interfaces/repositories/IBusinessProductRepository';
import { IBusinessProductService } from '../interfaces/services/IBusinessProductService';
import { IPurchaseOrderService } from '../interfaces/services/IPurchaseOrderService';

// Implementaciones
import { UserService } from '../services/userService';
import { UserRepository } from '../repositories/UserRepository';
import { SupplierService } from '../services/supplierService';
import { SupplierRepository } from '../repositories/SupplierRepository';
import { ProductService } from '../services/ProductService';
import { ProductRepository } from '../repositories/ProductRepository';
import { BusinessProductRepository } from '../repositories/BusinessProductRepository';
import { BusinessProductService } from '../services/BusinessProductService';
import { PurchaseOrderService } from '../services/purchaseOrderService';

export class DIContainer {
  private static instance: DIContainer;
  private services: Map<string, any> = new Map();
  private repositories: Map<string, any> = new Map();

  // Static instances for Business Product
  private static businessProductRepository: IBusinessProductRepository;
  private static businessProductService: IBusinessProductService;
  private static purchaseOrderService: PurchaseOrderService;

  private constructor() {
    this.registerDependencies();
  }

  public static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  /**
   * Registrar todas las dependencias del sistema
   */
  private registerDependencies(): void {
    this.services.set('PrismaClient', prisma);

    // Repositories
    this.repositories.set('UserRepository', new UserRepository(prisma));
    this.repositories.set('SupplierRepository', new SupplierRepository(prisma));
    this.repositories.set('ProductRepository', new ProductRepository(prisma));

    // Services
    this.services.set('UserService', new UserService());
    this.services.set('SupplierService', new SupplierService());
    this.services.set('ProductService', new ProductService(this.getRepository('ProductRepository')));
  }

  /**
   * Obtener un servicio por su nombre
   */
  public getService<T>(name: string): T {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Servicio '${name}' no encontrado en el contenedor DI`);
    }
    return service as T;
  }

  /**
   * Obtener un repositorio por su nombre
   */
  public getRepository<T>(name: string): T {
    const repository = this.repositories.get(name);
    if (!repository) {
      throw new Error(`Repositorio '${name}' no encontrado en el contenedor DI`);
    }
    return repository as T;
  }

  /**
   * Registrar un servicio manualmente
   */
  public registerService(name: string, service: any): void {
    this.services.set(name, service);
  }

  /**
   * Registrar un repositorio manualmente
   */
  public registerRepository(name: string, repository: any): void {
    this.repositories.set(name, repository);
  }

  /**
   * Métodos de conveniencia para obtener servicios específicos
   */
  public getUserService(): IUserService {
    return this.getService<IUserService>('UserService');
  }

  public getUserRepository(): IUserRepository {
    return this.getRepository<IUserRepository>('UserRepository');
  }

  public getSupplierService(): ISupplierService {
    return this.getService<ISupplierService>('SupplierService');
  }

  public getSupplierRepository(): ISupplierRepository {
    return this.getRepository<ISupplierRepository>('SupplierRepository');
  }

  public getProductService(): IProductService {
    return this.getService<IProductService>('ProductService');
  }

  public getProductRepository(): IProductRepository {
    return this.getRepository<IProductRepository>('ProductRepository');
  }

  public getPrismaClient(): PrismaClient {
    return this.getService<PrismaClient>('PrismaClient');
  }

  static getBusinessProductRepository(): IBusinessProductRepository {
    if (!this.businessProductRepository) {
      this.businessProductRepository = new BusinessProductRepository(prisma);
    }
    return this.businessProductRepository;
  }

  static getBusinessProductService(): IBusinessProductService {
    if (!this.businessProductService) {
      this.businessProductService = new BusinessProductService(this.getBusinessProductRepository());
    }
    return this.businessProductService;
  }

  static getPurchaseOrderService(): PurchaseOrderService {
    if (!this.purchaseOrderService) {
      this.purchaseOrderService = new PurchaseOrderService();
    }
    return this.purchaseOrderService;
  }
}

export const container = DIContainer.getInstance();
