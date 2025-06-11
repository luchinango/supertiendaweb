import {Router} from 'express';
import * as controller from '../controllers/businessController';
import {authenticate} from '../middlewares/authMiddleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Business
 *   description: Gestión de negocios
 */

/**
 * @swagger
 * /api/businesses:
 *   post:
 *     summary: Crear un nuevo negocio
 *     tags: [Business]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type_id
 *             properties:
 *               name:
 *                 type: string
 *               legal_name:
 *                 type: string
 *               description:
 *                 type: string
 *               tax_id:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               logo_url:
 *                 type: string
 *               website:
 *                 type: string
 *               timezone:
 *                 type: string
 *               currency:
 *                 type: string
 *               type_id:
 *                 type: integer
 */
router.post('/businesses', authenticate(['ADMIN']), controller.create);

/**
 * @swagger
 * /api/businesses:
 *   get:
 *     summary: Obtener lista de negocios
 *     tags: [Business]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, SUSPENDED]
 *         description: Filtrar por estado
 *       - in: query
 *         name: type_id
 *         schema:
 *           type: integer
 *         description: Filtrar por tipo de negocio
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nombre, razón social o NIT
 *     responses:
 *       200:
 *         description: Lista de negocios obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/businesses', authenticate(), controller.getAll);

/**
 * @swagger
 * /api/businesses/{id}:
 *   get:
 *     summary: Obtener un negocio por ID
 *     tags: [Business]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Negocio obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Negocio no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/businesses/:id', authenticate(), controller.getById);

/**
 * @swagger
 * /api/businesses/{id}:
 *   put:
 *     summary: Actualizar un negocio
 *     tags: [Business]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Negocio actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Negocio no encontrado
 *       500:
 *         description: Error del servidor
 */
router.put('/businesses/:id', authenticate(['ADMIN']), controller.update);

/**
 * @swagger
 * /api/businesses/{id}:
 *   delete:
 *     summary: Desactivar un negocio
 *     tags: [Business]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Negocio desactivado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Negocio no encontrado
 *       500:
 *         description: Error del servidor
 */
router.delete('/businesses/:id', authenticate(['ADMIN']), controller.remove);

/**
 * @swagger
 * /api/businesses/{businessId}/products:
 *   post:
 *     summary: Agregar producto a un negocio
 *     tags: [Business]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       201:
 *         description: Producto agregado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Negocio no encontrado
 *       500:
 *         description: Error del servidor
 */
router.post('/businesses/:businessId/products', authenticate(['ADMIN']), controller.addProduct);

/**
 * @swagger
 * /api/businesses/{businessId}/products/{productId}:
 *   put:
 *     summary: Actualizar producto en un negocio
 *     tags: [Business]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Producto actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Producto o negocio no encontrado
 *       500:
 *         description: Error del servidor
 */
router.put('/businesses/:businessId/products/:productId', authenticate(['ADMIN']), controller.updateProduct);

/**
 * @swagger
 * /api/businesses/{businessId}/products/{productId}:
 *   delete:
 *     summary: Remover producto de un negocio
 *     tags: [Business]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Producto removido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Producto o negocio no encontrado
 *       500:
 *         description: Error del servidor
 */
router.delete('/businesses/:businessId/products/:productId', authenticate(['ADMIN']), controller.removeProduct);

/**
 * @swagger
 * /api/businesses/{businessId}/products:
 *   get:
 *     summary: Obtener productos de un negocio
 *     tags: [Business]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Productos obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Negocio no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/businesses/:businessId/products', authenticate(), controller.getProducts);

export default router;
