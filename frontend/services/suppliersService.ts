import { PaginatedService } from "@/lib/api-utils";
import type { Supplier } from "@/types/types";
import type { PaginationOptions } from "@/types/Api";

class SuppliersService extends PaginatedService<Supplier> {
  constructor() {
    super("/suppliers");
  }

  /**
   * Obtiene proveedores con deuda
   */
  async getSuppliersWithDebt(): Promise<Supplier[]> {
    const response = await this.getList({
      page: 1,
      limit: 1000
    });
    return response.data.filter(supplier => supplier.hasDebt);
  }

  /**
   * Busca proveedores por término
   */
  async searchSuppliers(searchTerm: string, options: PaginationOptions = {}): Promise<Supplier[]> {
    const response = await this.getList({
      ...options,
      search: searchTerm
    });
    return response.data;
  }

  /**
   * Obtiene estadísticas de proveedores
   */
  async getStats(): Promise<{
    totalSuppliers: number;
    activeSuppliers: number;
    inactiveSuppliers: number;
    totalDebt: number;
    suppliersWithDebt: number;
  }> {
    const response = await this.getList({ limit: 1000 });
    const suppliers = response.data;

    return {
      totalSuppliers: suppliers.length,
      activeSuppliers: suppliers.filter(s => s.status === 'active').length,
      inactiveSuppliers: suppliers.filter(s => s.status === 'inactive').length,
      totalDebt: suppliers.reduce((total, s) => total + (s.debtAmount || 0), 0),
      suppliersWithDebt: suppliers.filter(s => s.hasDebt).length,
    };
  }

  /**
   * Obtiene proveedores activos únicamente
   */
  async getActiveSuppliers(options: PaginationOptions = {}): Promise<Supplier[]> {
    const response = await this.getList(options);
    return response.data.filter(supplier => supplier.status === 'active');
  }
}

const suppliersService = new SuppliersService();

export const getSuppliers = () => suppliersService.getAll();
export const getSuppliersPaginated = (page: number = 1, limit: number = 10) =>
  suppliersService.getList({ page, limit });
export const getSupplierById = (id: number) => suppliersService.getById(id);
export const createSupplier = (supplier: Partial<Supplier>) => suppliersService.create(supplier);
export const updateSupplier = (id: number, supplier: Partial<Supplier>) =>
  suppliersService.update(id, supplier);
export const deleteSupplier = (id: number) => suppliersService.delete(id);
export const getSuppliersWithDebt = () => suppliersService.getSuppliersWithDebt();
export const searchSuppliers = (searchTerm: string, options?: PaginationOptions) =>
  suppliersService.searchSuppliers(searchTerm, options);
export const getSuppliersStats = () => suppliersService.getStats();
export const getActiveSuppliers = (options?: PaginationOptions) =>
  suppliersService.getActiveSuppliers(options);

export { suppliersService };
