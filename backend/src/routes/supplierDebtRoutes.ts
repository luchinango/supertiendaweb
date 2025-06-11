import {Router} from 'express';
import * as controller from '../controllers/supplierDebtController';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: SupplierDebts
 *     description: Deudas con proveedores
 */

/**
 * @swagger
 * /api/supplier-debts:
 *   get:
 *     summary: Listar todas las deudas a proveedores
 *     tags: [SupplierDebts]
 *     responses:
 *       200:
 *         description: Lista de deudas
 */
router.get('/supplier-debts', controller.getAll);

/**
 * @swagger
 * /api/supplier-debts/{id}:
 *   get:
 *     summary: Obtener deuda de proveedor por ID
 *     tags: [SupplierDebts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Deuda encontrada
 *       404:
 *         description: No encontrado
 */
router.get('/supplier-debts/:id', controller.getById);

/**
 * @swagger
 * /api/supplier-debts:
 *   post:
 *     summary: Crear nueva deuda a proveedor
 *     tags: [SupplierDebts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SupplierDebt'
 *     responses:
 *       201:
 *         description: Deuda registrada
 */
router.post('/supplier-debts', controller.create);

/**
 * @swagger
 * /api/supplier-debts/{id}:
 *   put:
 *     summary: Actualizar saldo restante de deuda
 *     tags: [SupplierDebts]
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
 *             type: object
 *             properties:
 *               remaining_amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Deuda actualizada
 */
router.put('/supplier-debts/:id', controller.update);

/**
 * @swagger
 * /api/supplier-debts/{id}:
 *   delete:
 *     summary: Eliminar deuda de proveedor
 *     tags: [SupplierDebts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Deuda eliminada
 */
router.delete('/supplier-debts/:id', controller.remove);

export default router;
