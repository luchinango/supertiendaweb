import { PrismaClient } from '@prisma/client';

interface ProductData {
    nombre: string;
    descripcion: string;
    precio_compra: number;
    precio_venta: number;
    sku: string;
    barcode: string;
    category: string;
    subcategory: string;
    brand: string;
    unidad: string;
    minStock: number;
    maxStock: number;
    actualStock: number;
    fechaExpiracion: string;
    imagen: string;
    proveedorId?: number;
}

export class ProductService {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }
    
    async createProduct(productData: ProductData) {
        try {
            // Validar y transformar la fecha
            const fechaExpiracion = new Date(productData.fechaExpiracion);
            if (isNaN(fechaExpiracion.getTime())) {
                throw new Error('Fecha de expiración inválida');
            }

            // Validar datos numéricos
            if (productData.precio_compra < 0 || productData.precio_venta < 0) {
                throw new Error('Los precios no pueden ser negativos');
            }

            if (productData.minStock < 0 || productData.maxStock < 0 || productData.actualStock < 0) {
                throw new Error('Los valores de stock no pueden ser negativos');
            }

            if (productData.minStock > productData.maxStock) {
                throw new Error('El stock mínimo no puede ser mayor al máximo');
            }

            ;
        } catch (error) {
            console.error('Error en createProduct:', error);
            throw new Error(`Error al crear producto: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
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

    async updateProduct(id: string, productData: Partial<ProductData>) {
        try {
            const productoId = parseInt(id);
            if (isNaN(productoId)) throw new Error('ID inválido');

            // Transformar fecha si está presente
            if (productData.fechaExpiracion) {
                const fechaExpiracion = new Date(productData.fechaExpiracion);
                if (isNaN(fechaExpiracion.getTime())) {
                    throw new Error('Fecha de expiración inválida');
                }
                productData.fechaExpiracion = fechaExpiracion.toISOString();
            }

            return await this.prisma.producto.update({
                where: { id: productoId },
                data: productData
            });
        } catch (error) {
            console.error('Error en updateProduct:', error);
            throw new Error(`Error al actualizar producto: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    }

    async deleteProduct(id: string) {
        if (isNaN(parseInt(id))) throw new Error('ID inválido');
        return await this.prisma.producto.delete({ 
            where: { id: parseInt(id) } 
        });
    }
}