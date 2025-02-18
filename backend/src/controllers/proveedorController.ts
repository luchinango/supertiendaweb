import { Request, Response } from 'express';
import { ProveedorService } from '../services/proveedorService';

export class ProveedorController {
    private proveedorService: ProveedorService;

    constructor() {
        this.proveedorService = new ProveedorService();
    }

    async createProveedor(req: Request, res: Response) {
        try {
            const proveedor = await this.proveedorService.createProveedor(req.body);
            res.status(201).json(proveedor);
        } catch (error) {
            console.error('Error al crear proveedor:', error);
            res.status(400).json({ error: (error as Error).message });
        }
    }

    async getAllProveedores(req: Request, res: Response) {
        try {
            const proveedores = await this.proveedorService.getAllProveedores();
            res.json(proveedores);
        } catch (error) {
            console.error('Error al obtener proveedores:', error);
            res.status(500).json({ 
                error: 'Error al obtener proveedores',
                details: (error as Error).message 
            });
        }
    }

    async getProveedorById(req: Request, res: Response) {
        try {
            const proveedor = await this.proveedorService.getProveedorById(req.params.id);
            if (!proveedor) {
                return res.status(404).json({ error: 'Proveedor no encontrado' });
            }
            res.json(proveedor);
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }
}