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
                estado: 'activo',
                total: 0
            }
        });
    }

    async agregarItem(carritoId: number, productoId: number, cantidad: number) {
        return await this.prisma.$transaction(async (tx) => {
            const producto = await tx.producto.findUnique({
                where: { id: productoId }
            });

            if (!producto) throw new Error('Producto no encontrado');
            if (producto.actualStock < cantidad) throw new Error('Stock insuficiente');
            if (cantidad <= 0) throw new Error('Cantidad inválida');

            const itemExistente = await tx.carritoItem.findFirst({
                where: { carritoId, productoId }
            });

            if (itemExistente) {
                return await tx.carritoItem.update({
                    where: { id: itemExistente.id },
                    data: { cantidad: itemExistente.cantidad + cantidad }
                });
            }

            const item = await tx.carritoItem.create({
                data: {
                    carritoId,
                    productoId,
                    cantidad,
                    precio: producto.precio_venta
                }
            });

            await this.actualizarTotalCarrito(carritoId, tx);
            return item;
        });
    }

    async actualizarCantidadItem(itemId: number, cantidad: number) {
        return await this.prisma.$transaction(async (tx) => {
            const item = await tx.carritoItem.findUnique({
                where: { id: itemId },
                include: { producto: true }
            });

            if (!item) throw new Error('Item no encontrado');
            if (cantidad <= 0) throw new Error('Cantidad inválida');
            if (item.producto.actualStock < cantidad) throw new Error('Stock insuficiente');

            const itemActualizado = await tx.carritoItem.update({
                where: { id: itemId },
                data: { cantidad }
            });

            await this.actualizarTotalCarrito(item.carritoId, tx);
            return itemActualizado;
        });
    }

    async eliminarItem(itemId: number) {
        await this.prisma.$transaction(async (tx) => {
            const item = await tx.carritoItem.findUnique({
                where: { id: itemId }
            });

            if (!item) throw new Error('Item no encontrado');

            await tx.carritoItem.delete({
                where: { id: itemId }
            });

            await this.actualizarTotalCarrito(item.carritoId, tx);
        });
    }

    private async actualizarTotalCarrito(
        carritoId: number, 
        tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">
    ) {
        const items = await tx.carritoItem.findMany({
            where: { carritoId }
        });
    
        const total = items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    
        await tx.carrito.update({
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
        return await this.prisma.$transaction(async (tx) => {
            const carrito = await tx.carrito.findUnique({
                where: { id: carritoId },
                include: {
                    items: {
                        include: {
                            producto: true
                        }
                    }
                }
            });

            if (!carrito) throw new Error('Carrito no encontrado');
            if (carrito.estado === 'completado') throw new Error('Carrito ya completado');

            for (const item of carrito.items) {
                if (item.producto.actualStock < item.cantidad) {
                    throw new Error(`Stock insuficiente para ${item.producto.nombre}`);
                }
            }

            for (const item of carrito.items) {
                await tx.producto.update({
                    where: { id: item.productoId },
                    data: {
                        actualStock: { decrement: item.cantidad }
                    }
                });
            }

            const carritoActualizado = await tx.carrito.update({
                where: { id: carritoId },
                data: { estado: 'completado' },
                include: {
                    items: {
                        include: {
                            producto: true
                        }
                    }
                }
            });

            return carritoActualizado;
        });
    }
}
