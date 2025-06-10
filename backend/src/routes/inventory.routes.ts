import { Router } from 'express';
import * as controller from '../controllers/inventory.controller';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Inventory
 *     description: Gestión de inventario y stock
 */

/**
 * @swagger
 * /api/inventory/{businessId}/{productId}/stock:
 *   get:
 *     summary: Obtener stock actual de un producto
 *     tags: [Inventory]
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
 *         description: Stock actual del producto
 */
router.get('/inventory/:businessId/:productId/stock', 
  authenticate(['ADMIN', 'MANAGER', 'WAREHOUSE', 'CASHIER']), 
  controller.getCurrentStock
);

/**
 * @swagger
 * /api/inventory/{businessId}/low-stock:
 *   get:
 *     summary: Obtener productos con stock bajo
 *     tags: [Inventory]
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
 *         description: Lista de productos con stock bajo
 */
router.get('/inventory/:businessId/low-stock', 
  authenticate(['ADMIN', 'MANAGER', 'WAREHOUSE']), 
  controller.getLowStockProducts
);
 
/**
 * @swagger
 * /api/inventory/{businessId}/report:
 *   get:
 *     summary: Generar reporte de inventario
 *     tags: [Inventory]
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
 *         description: Reporte de inventario
 */
router.get('/inventory/:businessId/report', 
  authenticate(['ADMIN', 'MANAGER']), 
  controller.generateInventoryReport
);


export default router; 