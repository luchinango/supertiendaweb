import {Router} from 'express';
import * as controller from '../controllers/businessController';
import {authenticate} from '../middlewares/authMiddleware';
import {validateRequest} from '../middlewares/validation';

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
 *             $ref: '#/components/schemas/CreateBusinessRequest'
 *     responses:
 *       201:
 *         description: Negocio creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Business'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/businesses', authenticate(['ADMIN']), validateRequest('CreateBusinessRequest'), controller.create);

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
 *         name: businessType
 *         schema:
 *           type: string
 *           enum: [PERSONA_NATURAL, PERSONA_JURIDICA]
 *         description: Filtrar por tipo de negocio
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filtrar por departamento
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nombre, razón social o NIT
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Número de elementos por página
 *     responses:
 *       200:
 *         description: Lista de negocios obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BusinessListResponse'
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
 *               $ref: '#/components/schemas/Business'
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateBusinessRequest'
 *     responses:
 *       200:
 *         description: Negocio actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Business'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Negocio no encontrado
 *       500:
 *         description: Error del servidor
 */
router.put('/businesses/:id', authenticate(['ADMIN']), validateRequest('UpdateBusinessRequest'), controller.update);

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
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Negocio desactivado exitosamente
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
