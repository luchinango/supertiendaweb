import { PrismaClient } from '@prisma/client';

export class ProductService {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }
    
    async createProduct(productData: any) {
        return await this.prisma.producto.create({
            data: productData
        });
    }

    async getAllProducts() {
        try {
            return await this.prisma.producto.findMany();
        } catch (error) {
            console.error('Error en ProductService:', error);
            throw new Error(`Error al obtener productos desde productService: ${error}`);
        }
    }

    async getProductById(id: string) {
        try {
            const producto_id = parseInt(id);
            
            if (isNaN(producto_id)) {
                throw new Error('ID de producto inválido');
            }

            const product = await this.prisma.producto.findUnique({
                where: { 
                    id: producto_id 
                }
            });

            return product;
        } catch (error) {
            console.error('Error en ProductService.getProductById:', error);
            throw error;
        }
    }

    async updateProduct(id: string, productData: any) {
        if (isNaN(parseInt(id))) throw new Error('ID inválido');
        return await this.prisma.producto.update({
            where: { id: parseInt(id) },
            data: productData
        });
    }

    async deleteProduct(id: string) {
        if (isNaN(parseInt(id))) throw new Error('ID inválido');
        return await this.prisma.producto.delete({ 
            where: { id: parseInt(id) } 
        });
    }
}