import { Router } from 'express';
import * as controller from '../controllers/cashRegisterController';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     CashRegisterOpen:
 *       type: object
 *       required:
 *         - registerNumber
 *         - openingAmount
 *       properties:
 *         registerNumber:
 *           type: string
 *           description: Número único de la caja registradora
 *           example: "CAJA001"
 *         openingAmount:
 *           type: number
 *           description: Monto inicial de apertura
 *           example: 1000.00
 *         notes:
 *           type: string
 *           description: Notas adicionales
 *           example: "Caja principal del local"
 *
 *     CashRegisterClose:
 *       type: object
 *       required:
 *         - closingAmount
 *       properties:
 *         closingAmount:
 *           type: number
 *           description: Monto final de cierre
 *           example: 2500.00
 *         notes:
 *           type: string
 *           description: Notas del cierre
 *           example: "Cierre normal del día"
 *
 *     CashRegisterSummary:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         registerNumber:
 *           type: string
 *         openingAmount:
 *           type: number
 *         closingAmount:
 *           type: number
 *         currentAmount:
 *           type: number
 *         openingDate:
 *           type: string
 *           format: date-time
 *         closingDate:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *           enum: [OPEN, CLOSED, SUSPENDED]
 *         totalSales:
 *           type: number
 *         totalCashSales:
 *           type: number
 *         totalCardSales:
 *           type: number
 *         totalOtherSales:
 *           type: number
 *         salesCount:
 *           type: integer
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             username:
 *               type: string
 */

/**
 * @swagger
 * /api/cash-register/open:
 *   post:
 *     summary: Abre una nueva caja registradora
 *     tags: [Cash Register]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CashRegisterOpen'
 *     responses:
 *       201:
 *         description: Caja abierta exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/CashRegisterSummary'
 *       400:
 *         description: Error en los datos de entrada
 *       401:
 *         description: No autorizado
 */
router.post('/open', controller.openCashRegister);

/**
 * @swagger
 * /api/cash-register/{id}/close:
 *   post:
 *     summary: Cierra una caja registradora
 *     tags: [Cash Register]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la caja registradora
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CashRegisterClose'
 *     responses:
 *       200:
 *         description: Caja cerrada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/CashRegisterSummary'
 *       400:
 *         description: Error en los datos de entrada
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Caja no encontrada
 */
router.post('/:id/close', controller.closeCashRegister);

/**
 * @swagger
 * /api/cash-register/{id}/summary:
 *   get:
 *     summary: Obtiene el resumen de una caja registradora
 *     tags: [Cash Register]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la caja registradora
 *     responses:
 *       200:
 *         description: Resumen de la caja
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/CashRegisterSummary'
 *       404:
 *         description: Caja no encontrada
 */
router.get('/:id/summary', controller.getCashRegisterSummary);

/**
 * @swagger
 * /api/cash-register:
 *   get:
 *     summary: Lista las cajas registradoras del negocio
 *     tags: [Cash Register]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [OPEN, CLOSED, SUSPENDED]
 *         description: Filtrar por estado
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: Filtrar por usuario
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio para filtrar
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin para filtrar
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Límite de registros por página
 *     responses:
 *       200:
 *         description: Lista de cajas registradoras
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     cashRegisters:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/CashRegisterSummary'
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 */
router.get('/', controller.listCashRegisters);

/**
 * @swagger
 * /api/cash-register/current:
 *   get:
 *     summary: Obtiene la caja abierta actual del usuario
 *     tags: [Cash Register]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Caja actual abierta
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/CashRegisterSummary'
 *       404:
 *         description: No hay caja abierta
 */
router.get('/current', controller.getCurrentOpenCashRegister);

/**
 * @swagger
 * /api/cash-register/{id}/adjust:
 *   put:
 *     summary: Actualiza el monto actual de la caja
 *     tags: [Cash Register]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la caja registradora
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newAmount
 *               - reason
 *             properties:
 *               newAmount:
 *                 type: number
 *                 description: Nuevo monto actual
 *                 example: 1200.00
 *               reason:
 *                 type: string
 *                 description: Razón del ajuste
 *                 example: "Ajuste por diferencia encontrada"
 *     responses:
 *       200:
 *         description: Monto actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/CashRegisterSummary'
 *       400:
 *         description: Error en los datos de entrada
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Caja no encontrada
 */
router.put('/:id/adjust', controller.updateCurrentAmount);

/**
 * @swagger
 * /api/cash-register/{id}/audit:
 *   get:
 *     summary: Obtiene el historial de auditoría de una caja
 *     tags: [Cash Register]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la caja registradora
 *     responses:
 *       200:
 *         description: Historial de auditoría
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get('/:id/audit', controller.getAuditHistory);

export default router;
