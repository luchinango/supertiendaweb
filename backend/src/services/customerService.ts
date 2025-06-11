import prisma from '../config/prisma';
import {Department, DocumentType} from '../../prisma/generated';

export interface CreateCustomerInput {
  businessId: number;
  firstName: string;
  lastName?: string;
  documentType: DocumentType;
  documentNumber?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  department?: Department;
  country?: string;
  postalCode?: string;
  creditLimit?: number;
  currentBalance?: number;
  loyaltyPoints?: number;
  isActive?: boolean;
}

export interface UpdateCustomerInput {
  firstName?: string;
  lastName?: string;
  address?: string;
  phone?: string;
  documentType?: DocumentType;
  documentNumber?: string;
  email?: string;
  city?: string;
  department?: Department;
  country?: string;
  postalCode?: string;
  creditLimit?: number;
  currentBalance?: number;
  loyaltyPoints?: number;
  isActive?: boolean;
}

export class CustomerService {
  /**
   * Obtener todos los clientes
   */
  async getAllCustomers() {
    return await prisma.customer.findMany({
      orderBy: {firstName: 'asc'}
    });
  }

  /**
   * Obtener cliente por ID
   */
  async getCustomerById(id: number) {
    const customer = await prisma.customer.findUnique({
      where: {id}
    });

    if (!customer) {
      throw new Error('Cliente no encontrado');
    }

    return customer;
  }

  /**
   * Crear nuevo cliente
   */
  async createCustomer(data: CreateCustomerInput) {
    if (data.documentNumber) {
      const existingCustomer = await prisma.customer.findFirst({
        where: {
          documentType: data.documentType,
          documentNumber: data.documentNumber
        }
      });

      if (existingCustomer) {
        throw new Error('Ya existe un cliente con este documento');
      }
    }

    if (data.email) {
      const existingCustomer = await prisma.customer.findFirst({
        where: {email: data.email}
      });

      if (existingCustomer) {
        throw new Error('Ya existe un cliente con este email');
      }
    }

    return await prisma.customer.create({
      data
    });
  }

  /**
   * Actualizar cliente
   */
  async updateCustomer(id: number, data: UpdateCustomerInput) {
    const existingCustomer = await prisma.customer.findUnique({
      where: {id}
    });

    if (!existingCustomer) {
      throw new Error('Cliente no encontrado');
    }

    if (data.documentNumber && data.documentType) {
      const duplicateDocument = await prisma.customer.findFirst({
        where: {
          documentType: data.documentType,
          documentNumber: data.documentNumber,
          id: {not: id}
        }
      });

      if (duplicateDocument) {
        throw new Error('Ya existe otro cliente con este documento');
      }
    }

    if (data.email) {
      const duplicateEmail = await prisma.customer.findFirst({
        where: {
          email: data.email,
          id: {not: id}
        }
      });

      if (duplicateEmail) {
        throw new Error('Ya existe otro cliente con este email');
      }
    }

    return await prisma.customer.update({
      where: {id},
      data
    });
  }

  /**
   * Eliminar cliente
   */
  async deleteCustomer(id: number) {
    const existingCustomer = await prisma.customer.findUnique({
      where: {id}
    });

    if (!existingCustomer) {
      throw new Error('Cliente no encontrado');
    }

    const salesCount = await prisma.sale.count({
      where: {customerId: id}
    });

    if (salesCount > 0) {
      throw new Error('No se puede eliminar un cliente que tiene ventas asociadas');
    }

    await prisma.customer.delete({
      where: {id}
    });

    return {message: 'Cliente eliminado exitosamente'};
  }

  /**
   * Buscar clientes por documento (filtro)
   */
  async findByDocument(documentType?: DocumentType, documentNumber?: string) {
    const whereClause: any = {};

    if (documentType) {
      whereClause.documentType = documentType;
    }

    if (documentNumber) {
      whereClause.documentNumber = {
        contains: documentNumber,
        mode: 'insensitive'
      };
    }

    return await prisma.customer.findMany({
      where: whereClause,
      orderBy: {firstName: 'asc'}
    });
  }

  /**
   * Buscar clientes por nombre
   */
  async searchByName(query: string) {
    return await prisma.customer.findMany({
      where: {
        OR: [
          {firstName: {contains: query, mode: 'insensitive'}},
          {lastName: {contains: query, mode: 'insensitive'}}
        ]
      },
      orderBy: {firstName: 'asc'}
    });
  }

  /**
   * Obtener clientes activos
   */
  async getActiveCustomers() {
    return await prisma.customer.findMany({
      where: {isActive: true},
      orderBy: {firstName: 'asc'}
    });
  }
}

export const customerService = new CustomerService();
