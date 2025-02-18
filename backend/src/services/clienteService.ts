import { PrismaClient } from '@prisma/client';

export class ClienteService {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    async createCliente(productData: any) {
        return await this.prisma.cliente.create({
            data: productData
        });
    }

    async getAllClientes() {
        try {
            return await this.prisma.cliente.findMany();
        } catch (error) {
            console.error('Error al obtener clientes:', error);
            throw new Error(`Error al obtener clientes: ${error}`);
        }
    }

    async getClienteById(id: string) {
        try {
            const clienteId = parseInt(id);
            
            if (isNaN(clienteId)) {
                throw new Error('ID de cliente inválido');
            }

            return await this.prisma.cliente.findUnique({
                where: { id: clienteId }
            });
        } catch (error) {
            console.error('Error al obtener cliente por ID:', error);
            throw new Error(`Error al obtener cliente: ${error}`);
        }
    }

    async updateCliente(id: string, data: any) {
        try {
            const clienteId = parseInt(id);
            
            if (isNaN(clienteId)) {
                throw new Error('ID de cliente inválido');
            }

            return await this.prisma.cliente.update({
                where: { id: clienteId },
                data
            });
        } catch (error) {
            console.error('Error al actualizar cliente:', error);
            throw new Error(`Error al actualizar cliente: ${error}`);
        }
    }

    async deleteCliente(id: string) {
        try {
            const clienteId = parseInt(id);
            
            if (isNaN(clienteId)) {
                throw new Error('ID de cliente inválido');
            }

            return await this.prisma.cliente.delete({
                where: { id: clienteId }
            });
        } catch (error) {
            console.error('Error al eliminar cliente:', error);
            throw new Error(`Error al eliminar cliente: ${error}`);
        }
    }
}