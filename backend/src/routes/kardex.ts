import { Router, Request, Response } from "express";
import pool from "../config/db";

const router = Router();

// Endpoint: Registrar movimiento en el kardex (entrada o salida)
router.post(
  "/kardex/:productId/movements",
  
  async (req: Request, res: Response) => {
    console.log(`Solicitud recibida para /kardex/${req.params.productId}/movements`);

    const { productId } = req.params;
    const { movement_type, quantity, unit_price, reference_id, reference_type } = req.body;

    if (!["entry", "exit"].includes(movement_type)) {
      return res.status(400).json({ error: "Tipo de movimiento inválido" });
    }
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ error: "Cantidad inválida" });
    }

    try {
      await pool.query("BEGIN");
      const product = await pool.query(
        "SELECT actual_stock FROM products WHERE id = $1 FOR UPDATE",
        [productId]
      );
      if (product.rows.length === 0) {
        throw new Error("Producto no encontrado");
      }
      const currentStock = product.rows[0].actual_stock;
      const stockAfter = movement_type === "entry" ? currentStock + quantity : currentStock - quantity;
      if (stockAfter < 0) {
        throw new Error("Stock no puede ser negativo");
      }

      const kardexResult = await pool.query(
        `INSERT INTO kardex (product_id, movement_type, quantity, unit_price, reference_id, reference_type, stock_after)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [productId, movement_type, quantity, unit_price || null, reference_id || null, reference_type || null, stockAfter]
      );

      await pool.query("UPDATE products SET actual_stock = $1 WHERE id = $2", [stockAfter, productId]);
      await pool.query("COMMIT");
      res.status(201).json(kardexResult.rows[0]);
    } catch (error) {
      await pool.query("ROLLBACK");
      res.status(500).json({ error: (error as Error).message });
    }
  }
);

// Endpoint: Obtener kardex de un producto
router.get(
  "/kardex/:productId",
  async (req: Request, res: Response) => {
    console.log('productId:', req.params.productId);
    const { productId } = req.params;
    const { limit = "50", offset = "0" } = req.query;

    try {
      const result = await pool.query(
        `SELECT k.*, p.name AS product_name
         FROM kardex k
         JOIN products p ON k.product_id = p.id
         WHERE k.product_id = $1
         ORDER BY k.movement_date DESC
         LIMIT $2 OFFSET $3`,
        [productId, limit, offset]
      );

      res.json({
        total: result.rowCount,
        movements: result.rows,
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
);

// Endpoint: Comparar precios de compra de un producto
router.get(
  "/kardex/:productId/prices",
  async (req: Request, res: Response) => {
    const { productId } = req.params;

    try {
      const result = await pool.query(
        `SELECT poi.unit_price, po.created_at, s.name AS supplier_name
         FROM purchase_order_items poi
         JOIN purchase_orders po ON poi.purchase_order_id = po.id
         JOIN suppliers s ON po.supplier_id = s.id
         WHERE poi.product_id = $1
         ORDER BY po.created_at DESC`,
        [productId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "No se encontraron compras para este producto" });
      }

      const bestPrice = result.rows.reduce((min, current) =>
        current.unit_price < min.unit_price ? current : min
      );
      const worstPrice = result.rows.reduce((max, current) =>
        current.unit_price > max.unit_price ? current : max
      );
      const lastPrice = result.rows[0];

      res.json({
        purchase_history: result.rows,
        low_price: bestPrice,
        high_price: worstPrice, // Corregido de "best_price" a "high_price"
        lastPrice: lastPrice,
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
);

// Endpoint: Registrar compra y actualizar kardex
router.post("/kardex/purchase-orders", async (req: Request, res: Response) => {
  const { supplier_id, items } = req.body;

  if (!supplier_id || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Datos inválidos" });
  }

  try {
    await pool.query("BEGIN");
    const totalQuantity = items.reduce(
      (sum: number, item: { quantity: number }) => sum + item.quantity,
      0
    );

    const poResult = await pool.query(
      `INSERT INTO purchase_orders (supplier_id, quantity, created_at)
         VALUES ($1, $2, CURRENT_TIMESTAMP) RETURNING id`,
      [supplier_id, totalQuantity]
    );
    const purchaseOrderId = poResult.rows[0].id;

    for (const item of items) {
      const { product_id, quantity, unit_price } = item;

      await pool.query(
        `INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, unit_price)
           VALUES ($1, $2, $3, $4)`,
        [purchaseOrderId, product_id, quantity, unit_price]
      );

      const product = await pool.query(
        "SELECT actual_stock FROM products WHERE id = $1 FOR UPDATE",
        [product_id]
      );
      if (product.rows.length === 0) throw new Error("Producto no encontrado");
      const currentStock = product.rows[0].actual_stock;

      const stockAfter = currentStock + quantity;
      await pool.query(
        `INSERT INTO kardex (product_id, movement_type, quantity, unit_price, reference_id, reference_type, stock_after)
           VALUES ($1, 'entry', $2, $3, $4, 'purchase_order', $5)`,
        [product_id, quantity, unit_price, purchaseOrderId, stockAfter]
      );

      await pool.query("UPDATE products SET actual_stock = $1 WHERE id = $2", [stockAfter, product_id]);
    }

    await pool.query("COMMIT");
    res.status(201).json({
      message: "Compra registrada y kardex actualizado",
      purchase_order_id: purchaseOrderId,
    });
  } catch (error) {
    await pool.query("ROLLBACK");
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;