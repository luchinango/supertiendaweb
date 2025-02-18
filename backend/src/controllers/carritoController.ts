import { Request, Response } from 'express';
import { CarritoService } from '../services/carritoService';

export class CarritoController {
    private carritoService: CarritoService;

    constructor() {
        this.carritoService = new CarritoService();
    }

    async crearCarrito(req: Request, res: Response) {
        try {
            const { clienteId } = req.body;
            const carrito = await this.carritoService.crearCarrito(clienteId);
            res.status(201).json(carrito);
        } catch (error) {
            res.status(400).json({ error: (error as Error).message });
        }
    }

    async agregarItem(req: Request, res: Response) {
        try {
            const { carritoId, productoId, cantidad } = req.body;
            const item = await this.carritoService.agregarItem(carritoId, productoId, cantidad);
            res.status(201).json(item);
        } catch (error) {
            res.status(400).json({ error: (error as Error).message });
        }
    }

    async actualizarCantidadItem(req: Request, res: Response) {
        try {
            const { itemId } = req.params;
            const { cantidad } = req.body;
            const item = await this.carritoService.actualizarCantidadItem(parseInt(itemId), cantidad);
            res.json(item);
        } catch (error) {
            res.status(400).json({ error: (error as Error).message });
        }
    }

    async eliminarItem(req: Request, res: Response) {
        try {
            const { itemId } = req.params;
            await this.carritoService.eliminarItem(parseInt(itemId));
            res.status(204).send();
        } catch (error) {
            res.status(400).json({ error: (error as Error).message });
        }
    }

    async obtenerCarrito(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const carrito = await this.carritoService.obtenerCarrito(parseInt(id));
            if (!carrito) {
                return res.status(404).json({ error: 'Carrito no encontrado' });
            }
            res.json(carrito);
        } catch (error) {
            res.status(400).json({ error: (error as Error).message });
        }
    }

    async completarCarrito(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const carrito = await this.carritoService.completarCarrito(parseInt(id));
            res.json(carrito);
        } catch (error) {
            res.status(400).json({ error: (error as Error).message });
        }
    }
}