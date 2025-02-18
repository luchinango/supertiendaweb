import { Request, Response } from 'express';
import { ClienteService } from '../services/clienteService';

export class ClienteController {
    private clienteService: ClienteService;

    constructor() {
        this.clienteService = new ClienteService();
    }

    async createCliente(req: Request, res: Response) {
        try {
            const cliente = await this.clienteService.createCliente(req.body);
            res.status(201).json(cliente);
        } catch (error) {
            console.error('Error al crear cliente:', error);
            res.status(400).json({ error: (error as Error).message });
        }
    }

    async getAllClientes(req: Request, res: Response) {
        try {
            const clientes = await this.clienteService.getAllClientes();
            res.json(clientes);
        } catch (error) {
            console.error('Error al obtener clientes:', error);
            res.status(500).json({ 
                error: 'Error al obtener clientes',
                details: (error as Error).message 
            });
        }
    }

    async getClienteById(req: Request, res: Response) {
        try {
            const cliente = await this.clienteService.getClienteById(req.params.id);
            if (!cliente) {
                return res.status(404).json({ error: 'Cliente no encontrado' });
            }
            res.json(cliente);
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }

    async updateCliente(req: Request, res: Response) {
        try {
            const cliente = await this.clienteService.updateCliente(req.params.id, req.body);
            res.json(cliente);
        } catch (error) {
            res.status(400).json({ error: (error as Error).message });
        }
    }

    async deleteCliente(req: Request, res: Response) {
        try {
            await this.clienteService.deleteCliente(req.params.id);
            res.status(204).send();
        } catch (error) {
            res.status(400).json({ error: (error as Error).message });
        }
    }
}