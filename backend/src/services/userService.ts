import { PrismaClient } from '@prisma/client';

export class UserService {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }
    
    async createUser(data: any) {
        return await this.prisma.user.create({
            data
        });
    }

    async getAllUsers() {
        try {
            return await this.prisma.user.findMany();
        } catch (error) {
            console.error('Error en UserService:', error);
            throw error;
        }
    }

    async getUserById(id: string) {
        const userId = parseInt(id);
        if (isNaN(userId)) throw new Error('ID de usuario inválido');
        
        return await this.prisma.user.findUnique({
            where: { id: userId }
        });
    }

    async updateUser(id: string, data: any) {
        const userId = parseInt(id);
        if (isNaN(userId)) throw new Error('ID de usuario inválido');

        return await this.prisma.user.update({
            where: { id: userId },
            data
        });
    }

    async deleteUser(id: string) {
        const userId = parseInt(id);
        if (isNaN(userId)) throw new Error('ID de usuario inválido');

        return await this.prisma.user.delete({
            where: { id: userId }
        });
    }
}