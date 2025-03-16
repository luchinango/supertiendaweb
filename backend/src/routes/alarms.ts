import { Router } from "express";
import pool from '../config/db';
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.use(authenticate); // Todas las rutas después requieren token
router.use(authorize(["superuser", "system_admin", "client_supermarket_1", "client_supermarket_2"])); // Todas las rutas después requieren roles específicos

// Total de productos por vencer (7 días)
router.get("/expiring_products/total", async (req, res) => {
    try {
        const query = `
            SELECT COUNT(*) AS total
            FROM public.products
            WHERE expiration_date BETWEEN NOW() AND NOW() + INTERVAL '7 days';
        `;
        const result = await pool.query(query);
        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error fetching total expiring products:", err);
        res.status(500).json({ error: "Error fetching total expiring products" });
    }
});

// Total de productos vencidos
router.get("/expired_products/total", async (req, res) => {
    try {
        const query = `
            SELECT COUNT(*) AS total
            FROM public.products
            WHERE expiration_date < NOW();
        `;
        const result = await pool.query(query);
        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error fetching total expired products:", err);
        res.status(500).json({ error: "Error fetching total expired products" });
    }
});

// Total de productos con bajo stock
router.get("/low_stock_products/total", async (req, res) => {
    try {
        const query = `
            SELECT COUNT(*) AS total
            FROM public.products
            WHERE actual_stock <= min_stock AND alert_sent = FALSE;
        `;
        const result = await pool.query(query);
        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error fetching total low stock products:", err);
        res.status(500).json({ error: "Error fetching total low stock products" });
    }
});

// Productos por vencer (7 días)
router.get("/expiring_products", async (req, res) => {
    try {
        const query = `
            SELECT *
            FROM public.products
            WHERE expiration_date BETWEEN NOW() AND NOW() + INTERVAL '7 days';
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching expiring products:", err);
        res.status(500).json({ error: "Error fetching expiring products" });
    }
});

// Productos vencidos
router.get("/expired_products", async (req, res) => {
    try {
        const query = `
            SELECT *
            FROM public.products
            WHERE expiration_date < NOW();
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching expired products:", err);
        res.status(500).json({ error: "Error fetching expired products" });
    }
});

// Productos con bajo stock
router.get("/low_stock_products", async (req, res) => {
    try {
        const query = `
            SELECT *
            FROM public.products
            WHERE actual_stock <= min_stock AND alert_sent = FALSE;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching low stock products:", err);
        res.status(500).json({ error: "Error fetching low stock products" });
    }
});

// Acción: Retirar del inventario (productos vencidos)
router.put("/remove_expired_product/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            UPDATE public.products
            SET actual_stock = 0
            WHERE id = $1;
        `;
        await pool.query(query, [id]);
        res.json({ message: "Product removed from inventory" });
    } catch (err) {
        console.error("Error removing expired product:", err);
        res.status(500).json({ error: "Error removing expired product" });
    }
});

// Acción: Orden de compra (productos con bajo stock)
router.post("/create_purchase_order/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const productQuery = `SELECT * FROM public.products WHERE id = $1;`;
        const productResult = await pool.query(productQuery, [id]);
        const product = productResult.rows[0];

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        const query = `
            INSERT INTO public.purchase_orders (product_id, supplier_id, quantity, total_amount)
            VALUES ($1, $2, $3, $4);
        `;
        await pool.query(query, [product.id, product.supplier_id, product.max_stock, product.purchase_price * product.max_stock]);

        // Marcar la alerta como enviada
        const updateAlertQuery = `
            UPDATE public.products
            SET alert_sent = TRUE
            WHERE id = $1;
        `;
        await pool.query(updateAlertQuery, [id]);

        res.json({ message: "Purchase order created" });
    } catch (err) {
        console.error("Error creating purchase order:", err);
        res.status(500).json({ error: "Error creating purchase order" });
    }
});

// Lista de órdenes de compra
router.get("/purchase_orders", async (req, res) => {
    try {
        const query = `
            SELECT *
            FROM public.purchase_orders;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching purchase orders:", err);
        res.status(500).json({ error: "Error fetching purchase orders" });
    }
});

export default router;