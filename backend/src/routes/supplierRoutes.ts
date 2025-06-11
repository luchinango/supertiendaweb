import { Router } from 'express';
import * as controller from '../controllers/supplierController';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Suppliers
 *     description: Gestión de proveedores
 */

/**
 * @swagger
 * /api/suppliers:
 *   get:
 *     summary: Listar todos los proveedores
 *     tags: [Suppliers]
 *     responses:
 *       200:
 *         description: Lista de proveedores
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Supplier'
 */
router.get('/suppliers', controller.getAll);

/**
 * @swagger
 * /api/suppliers/{id}:
 *   get:
 *     summary: Obtener proveedor por ID
 *     tags: [Suppliers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Proveedor encontrado
 *       404:
 *         description: No encontrado
 */
router.get('/suppliers/:id', controller.getById);

/**
 * @swagger
 * /api/suppliers:
 *   post:
 *     summary: Crear nuevo proveedor
 *     tags: [Suppliers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Supplier'
 *     responses:
 *       201:
 *         description: Proveedor creado
 *       400:
 *         description: NIT duplicado
 */
router.post('/suppliers', controller.create);

/**
 * @swagger
 * /api/suppliers/{id}:
 *   put:
 *     summary: Actualizar proveedor
 *     tags: [Suppliers]
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
 *             $ref: '#/components/schemas/Supplier'
 *     responses:
 *       200:
 *         description: Proveedor actualizado
 */
router.put('/suppliers/:id', controller.update);

/**
 * @swagger
 * /api/suppliers/{id}:
 *   delete:
 *     summary: Eliminar proveedor
 *     tags: [Suppliers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Proveedor eliminado
 */
router.delete('/suppliers/:id', controller.remove);

export default router;
