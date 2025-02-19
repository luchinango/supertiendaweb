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
            if (!clienteId) throw new Error('clienteId es requerido');
            
            const carrito = await this.carritoService.crearCarrito(Number(clienteId));
            res.status(201).json(carrito);
        } catch (error) {
            this.handleError(res, error);
        }
    }

    async agregarItem(req: Request, res: Response) {
        try {
            const { carritoId, productoId, cantidad } = req.body;
            this.validateRequiredFields({ carritoId, productoId, cantidad });
            
            const item = await this.carritoService.agregarItem(
                Number(carritoId),
                Number(productoId),
                Number(cantidad)
            );
            res.status(201).json(item);
        } catch (error) {
            this.handleError(res, error);
        }
    }

    async actualizarCantidadItem(req: Request, res: Response) {
        try {
            const { itemId } = req.params;
            const { cantidad } = req.body;
            this.validateRequiredFields({ cantidad });
            
            const item = await this.carritoService.actualizarCantidadItem(
                Number(itemId),
                Number(cantidad)
            );
            res.json(item);
        } catch (error) {
            this.handleError(res, error);
        }
    }

    async eliminarItem(req: Request, res: Response) {
        try {
            const { itemId } = req.params;
            await this.carritoService.eliminarItem(Number(itemId));
            res.status(204).send();
        } catch (error) {
            this.handleError(res, error);
        }
    }

    async obtenerCarrito(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const carrito = await this.carritoService.obtenerCarrito(Number(id));
            carrito ? res.json(carrito) : res.status(404).json({ error: 'Carrito no encontrado' });
        } catch (error) {
            this.handleError(res, error);
        }
    }

    async completarCarrito(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const carrito = await this.carritoService.completarCarrito(Number(id));
            res.json(carrito);
        } catch (error) {
            this.handleError(res, error);
        }
    }

    private validateRequiredFields(fields: Record<string, any>) {
        for (const [key, value] of Object.entries(fields)) {
            if (value === undefined || value === null) {
                throw new Error(`${key} es requerido`);
            }
        }
    }

    private handleError(res: Response, error: unknown) {
        const err = error as Error;
        const statusCode = err.message.includes('no encontrado') ? 404 : 400;
        res.status(statusCode).json({ error: err.message });
    }
}