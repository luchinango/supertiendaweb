import express from 'express';
import { ClienteController } from '../controllers/clienteController';

const router = express.Router();
const clienteController = new ClienteController();

router.post('/clientes', clienteController.createCliente.bind(clienteController));
router.get('/clientes', clienteController.getAllClientes.bind(clienteController));
router.get('/clientes/:id', clienteController.getClienteById.bind(clienteController));
router.put('/clientes/:id', clienteController.updateCliente.bind(clienteController));
router.delete('/clientes/:id', clienteController.deleteCliente.bind(clienteController));

export default router;