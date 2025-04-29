import {Router} from 'express';
import * as controller from '../controllers/consignmentItem.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: ConsignmentItems
 *     description: Gestión de productos consignados
 */

/**
 * @swagger
 * /api/consignment-items:
 *   get:
 *     summary: Listar todos los productos consignados
 *     tags: [ConsignmentItems]
 *     responses:
 *       200:
 *         description: Lista de productos consignados
 */
router.get('/consignment-items', controller.getAll);

/**
 * @swagger
 * /api/consignment-items/{id}:
 *   get:
 *     summary: Obtener producto consignado por ID
 *     tags: [ConsignmentItems]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Producto consignado encontrado
 *       404:
 *         description: No encontrado
 */
router.get('/consignment-items/:id', controller.getById);

/**
 * @swagger
 * /api/consignment-items:
 *   post:
 *     summary: Crear producto consignado
 *     tags: [ConsignmentItems]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ConsignmentItem'
 *     responses:
 *       201:
 *         description: Producto consignado creado
 */
router.post('/consignment-items', controller.create);

/**
 * @swagger
 * /api/consignment-items/{id}:
 *   put:
 *     summary: Actualizar producto consignado
 *     tags: [ConsignmentItems]
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
 *             $ref: '#/components/schemas/ConsignmentItem'
 *     responses:
 *       200:
 *         description: Producto consignado actualizado
 */
router.put('/consignment-items/:id', controller.update);

/**
 * @swagger
 * /api/consignment-items/{id}:
 *   delete:
 *     summary: Eliminar producto consignado
 *     tags: [ConsignmentItems]
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
router.delete('/consignment-items/:id', controller.remove);

export default router;
