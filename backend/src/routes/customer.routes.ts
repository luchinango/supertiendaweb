import { Router } from 'express';
import * as controller from '../controllers/customer.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Customers
 *     description: Gestión de clientes
 */

/**
 * @swagger
 * /api/customers:
 *   get:
 *     summary: Listar todos los clientes
 *     tags: [Customers]
 *     responses:
 *       200:
 *         description: Lista de clientes
 */
router.get('/customers', controller.getAll);

/**
 * @swagger
 * /api/customers/search:
 *   get:
 *     summary: Filtrar clientes por documento
 *     description: Filtra clientes por tipo y/o número de documento (búsqueda parcial)
 *     tags: [Customers]
 *     parameters:
 *       - in: query
 *         name: documentType
 *         required: false
 *         schema:
 *           type: string
 *           enum: [CI, NIT, PASSPORT, FOREIGN_ID]
 *         description: Tipo de documento (opcional)
 *       - in: query
 *         name: documentNumber
 *         required: false
 *         schema:
 *           type: string
 *         description: Número de documento (búsqueda parcial, opcional)
 *     responses:
 *       200:
 *         description: Lista de clientes que coinciden con los filtros
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Al menos un filtro debe ser proporcionado
 *       500:
 *         description: Error del servidor
 */
router.get('/customers/search', controller.findByDocument);

/**
 * @swagger
 * /api/customers/{id}:
 *   get:
 *     summary: Obtener cliente por ID
 *     tags: [Customers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cliente encontrado
 *       404:
 *         description: No encontrado
 */
router.get('/customers/:id', controller.getById);

/**
 * @swagger
 * /api/customers:
 *   post:
 *     summary: Crear nuevo cliente
 *     tags: [Customers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Customer'
 *     responses:
 *       201:
 *         description: Cliente creado
 *       400:
 *         description: NIT o Email duplicado
 */
router.post('/customers', controller.create);

/**
 * @swagger
 * /api/customers/{id}:
 *   put:
 *     summary: Actualizar cliente
 *     tags: [Customers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Customer'
 *     responses:
 *       200:
 *         description: Cliente actualizado
 */
router.put('/customers/:id', controller.update);

/**
 * @swagger
 * /api/customers/{id}:
 *   delete:
 *     summary: Eliminar cliente
 *     tags: [Customers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Cliente eliminado exitosamente
 */
router.delete('/customers/:id', controller.remove);

export default router;
