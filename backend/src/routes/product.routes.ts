import { Router } from 'express';
import * as productController from '../controllers/product.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Products
 *     description: Gestión de productos
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Listar todos los productos
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Lista de productos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
router.get('/products', productController.getAll);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Obtener producto por ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Producto encontrado
 *       404:
 *         description: No encontrado
 */
router.get('/products/:id', productController.getById);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Crear nuevo producto
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Producto creado
 *       400:
 *         description: Código de barras duplicado
 */
router.post('/products', productController.create);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Actualizar producto
 *     tags: [Products]
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
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Producto actualizado
 */
router.put('/products/:id', productController.update);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Eliminar producto
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Producto eliminado
 */
router.delete('/products/:id', productController.remove);

export default router;
