import {Router} from 'express';
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
 *     summary: Listar todos los proveedores con paginación y filtros
 *     tags: [Suppliers]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nombre, código, NIT o persona de contacto
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, SUSPENDED]
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *           enum: [LA_PAZ, COCHABAMBA, SANTA_CRUZ, ORURO, POTOSI, TARIJA, CHUQUISACA, BENI, PANDO]
 *       - in: query
 *         name: documentType
 *         schema:
 *           type: string
 *           enum: [NIT, CI, PASSPORT, FOREIGN_ID]
 *     responses:
 *       200:
 *         description: Lista de proveedores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SupplierListResponse'
 */
router.get('/suppliers', controller.getAll);

/**
 * @swagger
 * /api/suppliers/search:
 *   get:
 *     summary: Búsqueda rápida de proveedores
 *     tags: [Suppliers]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Término de búsqueda (mínimo 2 caracteres)
 *     responses:
 *       200:
 *         description: Resultados de búsqueda
 *       400:
 *         description: Término de búsqueda inválido
 */
router.get('/suppliers/search', controller.search);

/**
 * @swagger
 * /api/suppliers/stats:
 *   get:
 *     summary: Obtener estadísticas de proveedores
 *     tags: [Suppliers]
 *     responses:
 *       200:
 *         description: Estadísticas de proveedores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SupplierStats'
 */
router.get('/suppliers/stats', controller.getStats);

/**
 * @swagger
 * /api/suppliers/debt:
 *   get:
 *     summary: Obtener proveedores con deuda pendiente
 *     tags: [Suppliers]
 *     responses:
 *       200:
 *         description: Lista de proveedores con deuda
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SupplierResponse'
 */
router.get('/suppliers/debt', controller.getSuppliersWithDebt);

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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SupplierResponse'
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
 *             $ref: '#/components/schemas/CreateSupplierRequest'
 *     responses:
 *       201:
 *         description: Proveedor creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SupplierResponse'
 *       400:
 *         description: Datos inválidos o duplicados
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
 *             $ref: '#/components/schemas/UpdateSupplierRequest'
 *     responses:
 *       200:
 *         description: Proveedor actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SupplierResponse'
 *       404:
 *         description: Proveedor no encontrado
 *       400:
 *         description: Datos inválidos o duplicados
 */
router.put('/suppliers/:id', controller.update);

/**
 * @swagger
 * /api/suppliers/{id}:
 *   delete:
 *     summary: Eliminar proveedor (soft delete)
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
 *       404:
 *         description: Proveedor no encontrado
 */
router.delete('/suppliers/:id', controller.remove);

export default router;
