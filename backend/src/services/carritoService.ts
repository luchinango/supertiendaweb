import { PrismaClient } from '@prisma/client';

export class CarritoService {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    async crearCarrito(clienteId: number) {
        return await this.prisma.carrito.create({
            data: {
                clienteId,
                estado: 'activo'
            }
        });
    }

    async agregarItem(carritoId: number, productoId: number, cantidad: number) {
        // Primero verificamos el producto
        const producto = await this.prisma.producto.findUnique({
            where: { id: productoId }
        });

        if (!producto) throw new Error('Producto no encontrado');
        if (producto.actualStock < cantidad) throw new Error('Stock insuficiente');

        // Agregamos el item al carrito
        const item = await this.prisma.carritoItem.create({
            data: {
                carritoId,
                productoId,
                cantidad,
                precio: producto.precio_venta
            }
        });

        // Actualizamos el total del carrito
        await this.actualizarTotalCarrito(carritoId);

        return item;
    }

    async actualizarCantidadItem(itemId: number, cantidad: number) {
        const item = await this.prisma.carritoItem.findUnique({
            where: { id: itemId },
            include: { producto: true }
        });

        if (!item) throw new Error('Item no encontrado');
        if (item.producto.actualStock < cantidad) throw new Error('Stock insuficiente');

        const itemActualizado = await this.prisma.carritoItem.update({
            where: { id: itemId },
            data: { cantidad }
        });

        await this.actualizarTotalCarrito(item.carritoId);

        return itemActualizado;
    }

    async eliminarItem(itemId: number) {
        const item = await this.prisma.carritoItem.findUnique({
            where: { id: itemId }
        });

        if (!item) throw new Error('Item no encontrado');

        await this.prisma.carritoItem.delete({
            where: { id: itemId }
        });

        await this.actualizarTotalCarrito(item.carritoId);
    }

    private async actualizarTotalCarrito(carritoId: number) {
        const items = await this.prisma.carritoItem.findMany({
            where: { carritoId }
        });

        const total: number = items.reduce((sum: number, item: { precio: number; cantidad: number }) => sum + (item.precio * item.cantidad), 0);

        await this.prisma.carrito.update({
            where: { id: carritoId },
            data: { total }
        });
    }

    async obtenerCarrito(carritoId: number) {
        return await this.prisma.carrito.findUnique({
            where: { id: carritoId },
            include: {
                items: {
                    include: {
                        producto: true
                    }
                },
                cliente: true
            }
        });
    }

    async completarCarrito(carritoId: number) {
        // Verificar stock antes de completar
        const carrito = await this.obtenerCarrito(carritoId);
        if (!carrito) throw new Error('Carrito no encontrado');

        for (const item of carrito.items) {
            if (item.producto.actualStock < item.cantidad) {
                throw new Error(`Stock insuficiente para ${item.producto.nombre}`);
            }
        }

        // Actualizar stock y estado del carrito
        await this.prisma.$transaction(async (prisma: PrismaClient) => {
            for (const item of carrito.items) {
            await prisma.producto.update({
                where: { id: item.productoId },
                data: {
                actualStock: { decrement: item.cantidad }
                }
            });
            }

            await prisma.carrito.update({
            where: { id: carritoId },
            data: { estado: 'completado' }
            });
        });

        return await this.obtenerCarrito(carritoId);
    }
}