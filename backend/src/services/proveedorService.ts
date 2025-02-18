import { PrismaClient } from '@prisma/client';

export class ProveedorService {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    async createProveedor(data: any) {
        try {
            return await this.prisma.proveedor.create({
                data
            });
        } catch (error) {
            console.error('Error al crear proveedor:', error);
            throw new Error(`Error al crear proveedor: ${error}`);
        }
    }

    async getAllProveedores() {
        try {
            return await this.prisma.proveedor.findMany({
                include: {
                    productos: true // Incluye los productos relacionados
                }
            });
        } catch (error) {
            console.error('Error al obtener proveedores:', error);
            throw new Error(`Error al obtener proveedores: ${error}`);
        }
    }

    async getProveedorById(id: string) {
        try {
            const proveedorId = parseInt(id);
            
            if (isNaN(proveedorId)) {
                throw new Error('ID de proveedor inválido');
            }

            return await this.prisma.proveedor.findUnique({
                where: { 
                    id: proveedorId 
                },
                include: {
                    productos: true // Incluye los productos relacionados
                }
            });
        } catch (error) {
            console.error('Error al obtener proveedor por ID:', error);
            throw new Error(`Error al obtener proveedor: ${error}`);
        }
    }

    async updateProveedor(id: string, data: any) {
        try {
            const proveedorId = parseInt(id);
            
            if (isNaN(proveedorId)) {
                throw new Error('ID de proveedor inválido');
            }

            return await this.prisma.proveedor.update({
                where: { 
                    id: proveedorId 
                },
                data
            });
        } catch (error) {
            console.error('Error al actualizar proveedor:', error);
            throw new Error(`Error al actualizar proveedor: ${error}`);
        }
    }

    async deleteProveedor(id: string) {
        try {
            const proveedorId = parseInt(id);
            
            if (isNaN(proveedorId)) {
                throw new Error('ID de proveedor inválido');
            }

            return await this.prisma.proveedor.delete({
                where: { 
                    id: proveedorId 
                }
            });
        } catch (error) {
            console.error('Error al eliminar proveedor:', error);
            throw new Error(`Error al eliminar proveedor: ${error}`);
        }
    }
}