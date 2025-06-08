import {Router} from 'express';
import * as businessController from '../controllers/business.controller';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Business
 *   description: Gestión de negocios
 */

/**
 * @swagger
 * /api/business:
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
router.post('/', authenticate(['ADMIN']), businessController.create);

/**
 * @swagger
 * /api/business:
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
 */
router.get('/', authenticate(), businessController.getAll);

/**
 * @swagger
 * /api/business/{id}:
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
 */
router.get('/:id', authenticate(), businessController.getById);

/**
 * @swagger
 * /api/business/{id}:
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
 */
router.put('/:id', authenticate(['ADMIN']), businessController.update);

/**
 * @swagger
 * /api/business/{id}:
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
 */
router.delete('/:id', authenticate(['ADMIN']), businessController.remove);

/**
 * @swagger
 * /api/business/types:
 *   get:
 *     summary: Obtener tipos de negocio
 *     tags: [Business]
 *     security:
 *       - bearerAuth: []
 */
router.get('/types', authenticate(), businessController.getBusinessTypes);

/**
 * @swagger
 * /api/business/{businessId}/products:
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
 */
router.post('/:businessId/products', authenticate(['ADMIN']), businessController.addProduct);

/**
 * @swagger
 * /api/business/{businessId}/products/{productId}:
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
 */
router.put('/:businessId/products/:productId', authenticate(['ADMIN']), businessController.updateProduct);

/**
 * @swagger
 * /api/business/{businessId}/products/{productId}:
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
 */
router.delete('/:businessId/products/:productId', authenticate(['ADMIN']), businessController.removeProduct);

/**
 * @swagger
 * /api/business/{businessId}/products:
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
 */
router.get('/:businessId/products', authenticate(), businessController.getProducts);

export default router;
