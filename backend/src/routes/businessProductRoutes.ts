import { Router } from 'express';
import * as controller from '../controllers/businessProductController';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: BusinessProducts
 *     description: Productos personalizados por negocio
 */

/**
 * @swagger
 * /api/business-products:
 *   get:
 *     summary: Listar todos los productos asignados a negocios
 *     tags: [BusinessProducts]
 *     responses:
 *       200:
 *         description: Lista de asignaciones
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BusinessProduct'
 */
router.get('/business-products', controller.getAll);

/**
 * @swagger
 * /api/business-products/{id}:
 *   get:
 *     summary: Obtener asignación de producto por ID
 *     tags: [BusinessProducts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Asignación encontrada
 *       404:
 *         description: No encontrado
 */
router.get('/business-products/:id', controller.getById);

/**
 * @swagger
 * /api/business-products:
 *   post:
 *     summary: Crear una nueva asignación de producto a negocio
 *     tags: [BusinessProducts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [businessId, productId]
 *             properties:
 *               businessId:
 *                 type: integer
 *               productId:
 *                 type: integer
 *               customPrice:
 *                 type: number
 *                 format: decimal
 *               actualStock:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Asignación creada
 *       400:
 *         description: Asignación duplicada
 */
router.post('/business-products', controller.create);

/**
 * @swagger
 * /api/business-products/{id}:
 *   put:
 *     summary: Actualizar asignación de producto a negocio
 *     tags: [BusinessProducts]
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
 *               customPrice:
 *                 type: number
 *               actualStock:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Asignación actualizada
 */
router.put('/business-products/:id', controller.update);

/**
 * @swagger
 * /api/business-products/{id}:
 *   delete:
 *     summary: Eliminar asignación de producto
 *     tags: [BusinessProducts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Eliminado exitosamente
 */
router.delete('/business-products/:id', controller.remove);

export default router;
