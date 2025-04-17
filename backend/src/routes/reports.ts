import { Router, Request, Response } from "express";
import pool from "../config/db";
import { authenticate, authorize } from "../middleware/auth";
import PDFDocument from "pdfkit";
import escpos from "escpos";

const router = Router();

// router.use(authenticate); // Todas las rutas después requieren token
// router.use(authorize(["superuser", "system_admin"])); // Todas las rutas después requieren roles específicos

router.get("/", async (req, res) => {
  try {
    // Ventas totales (usando amount y created_at)
    const querySales = `
            SELECT 
                COALESCE(SUM(amount), 0) AS total_sales, 
                DATE_PART('month', NOW() - INTERVAL '1 month') AS last_month
            FROM public.transactions
            WHERE created_at >= NOW() - INTERVAL '1 month'
        `;
    const salesResult = await pool.query(querySales);
    const totalSales = salesResult.rows[0]?.total_sales || 0;

    // Productos vendidos último mes (usando cart_items y cart)
    const queryProducts = `
SELECT 
COALESCE(SUM(ci.quantity), 0) AS products_sold
FROM public.cart_items ci
JOIN public.cart c ON ci.cart_id = c.id
WHERE c.created_at >= NOW() - INTERVAL '1 month'
`;
    const productsResult = await pool.query(queryProducts);
    const productsSold = productsResult.rows[0]?.products_sold || 0;

    // Total de productos vendidos históricos
    const queryTotalProducts = `
SELECT 
COALESCE(SUM(ci.quantity), 0) AS total_products_sold
FROM public.cart_items ci
JOIN public.cart c ON ci.cart_id = c.id
`;

    const totalProductsResult = await pool.query(queryTotalProducts);
    const totalProductsSold =
      totalProductsResult.rows[0]?.total_products_sold || 0;

    // Clientes activos (usando customer_id y created_at)
    const queryActiveCustomers = `
            SELECT COUNT(DISTINCT customer_id) AS active_customers
            FROM public.transactions
            WHERE created_at >= NOW() - INTERVAL '1 month'
        `;
    const customersResult = await pool.query(queryActiveCustomers);
    const activeCustomers = customersResult.rows[0]?.active_customers || 0;

    // Inventario total (sin cambios)
    const queryInventory = `
            SELECT COALESCE(SUM(actual_stock), 0) AS total_inventory 
            FROM public.products
        `;
    const inventoryResult = await pool.query(queryInventory);
    const totalInventory = inventoryResult.rows[0]?.total_inventory || 0;

    res.json({
      totalSales,
      productsSold,
      totalProductsSold, // Nuevo campo agregado
      activeCustomers,
      totalInventory,
    });
  } catch (err) {
    console.error("Error fetching report data:", err);
    res.status(500).json({ error: "Error generating the report" });
  }
});

router.get("/balance", async (req, res) => {
  try {
    const query = `
          SELECT
              (SELECT COALESCE(SUM(amount), 0) FROM public.transactions) -
              (SELECT COALESCE(SUM(total_amount), 0) FROM public.purchase_orders) -
              (SELECT COALESCE(SUM(amount), 0) FROM public.debt_payments) -
              (SELECT COALESCE(SUM(value), 0) FROM public.mermas) AS balance;
      `;
    const result = await pool.query(query);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching balance:", err);
    res.status(500).json({ error: "Error fetching balance" });
  }
});

router.get("/expenses", async (req, res) => {
  try {
    const query = `
          SELECT COALESCE(SUM(total_amount), 0) AS total_expenses FROM public.purchase_orders
          UNION ALL
          SELECT COALESCE(SUM(amount), 0) FROM public.debt_payments
          UNION ALL
          SELECT COALESCE(SUM(value), 0) FROM public.mermas;
      `;
    const result = await pool.query(query);
    // Sumar los resultados
    const totalExpenses = result.rows.reduce(
      (sum, row) => sum + parseFloat(row.total_expenses || row.sum),
      0
    );
    res.json({ totalExpenses });
  } catch (err) {
    console.error("Error fetching expenses:", err);
    res.status(500).json({ error: "Error fetching expenses" });
  }
});

router.get("/sales", async (req, res) => {
  try {
    const query = `SELECT COALESCE(SUM(amount), 0) AS total_sales FROM public.transactions;`;
    const result = await pool.query(query);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching sales:", err);
    res.status(500).json({ error: "Error fetching sales" });
  }
});

// Reportes de las transacciones
// Puedes filtrar por fecha y periodo (diario, semanal, mensual, trimestral, semestral, anual)
router.get("/transactions", async (req, res) => {
  try {
    const { startDate, endDate, period } = req.query as {
      startDate?: string;
      endDate?: string;
      period?: string;
    };

    let query = `
      SELECT 
        id, 
        amount, 
        created_at, 
        customer_id, 
        type,
        CASE 
          WHEN type = 'credit' THEN 'pending'
          WHEN type = 'cash' THEN 'completed'
          ELSE 'unknown'
        END AS status
      FROM public.transactions
    `;
    const queryParams: string[] = [];

    if (startDate || endDate) {
      query += ` WHERE `;
      if (startDate) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
          throw new Error("Invalid startDate format. Use YYYY-MM-DD");
        }
        queryParams.push(startDate);
        query += `created_at >= $${queryParams.length}`;
      }
      if (endDate) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
          throw new Error("Invalid endDate format. Use YYYY-MM-DD");
        }
        if (startDate) query += ` AND `;
        queryParams.push(endDate);
        query += `created_at <= $${queryParams.length}`;
      }
    }

    if (period) {
      const periodConditions: { [key: string]: string } = {
        daily: "DATE_TRUNC('day', created_at) = CURRENT_DATE",
        weekly: "DATE_TRUNC('week', created_at) = DATE_TRUNC('week', CURRENT_DATE)",
        monthly: "DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)",
        quarterly: "DATE_TRUNC('quarter', created_at) = DATE_TRUNC('quarter', CURRENT_DATE)",
        semiannual:
          "DATE_TRUNC('month', created_at) >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '6 months') AND DATE_TRUNC('month', created_at) <= DATE_TRUNC('month', CURRENT_DATE)",
        yearly: "DATE_TRUNC('year', created_at) = DATE_TRUNC('year', CURRENT_DATE)",
      };

      const periodLower = period.toLowerCase();
      if (periodConditions[periodLower]) {
        query += startDate || endDate ? ` AND ` : ` WHERE `;
        query += periodConditions[periodLower];
      } else {
        throw new Error(
          `Invalid period value. Valid options: ${Object.keys(periodConditions).join(", ")}`
        );
      }
    }

    query += ` ORDER BY created_at ASC;`;

    console.log("Query:", query);
    console.log("Params:", queryParams);

    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (err: any) {
    console.error("Error fetching transactions:", {
      message: err.message,
      stack: err.stack,
      queryParams: req.query,
    });
    res.status(500).json({
      error: "Error fetching transactions",
      details: err.message,
    });
  }
});

router.get("/transactions/income", async (req, res) => {
  try {
    const query = `
      SELECT 
        id, 
        amount, 
        created_at, 
        type,
        type AS payment_method,
        CASE 
          WHEN type = 'cash' THEN 'completed'
          WHEN type = 'credit' THEN 'pending'
          ELSE 'unknown'
        END AS status
      FROM public.transactions 
      WHERE type IN ('cash', 'credit');
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err: any) {
    console.error("Error fetching income transactions:", {
      message: err.message,
      stack: err.stack,
    });
    res.status(500).json({
      error: "Error fetching income transactions",
      details:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Internal server error",
    });
  }
});

router.get("/transactions/expenses", async (req, res) => {
  try {
    const query = `
      SELECT 
        'purchase_order' AS type, 
        id, 
        total_amount AS amount, 
        created_at, 
        'unknown' AS payment_method,
        'completed' AS status
      FROM public.purchase_orders
      UNION ALL
      SELECT 
        'debt_payment' AS type, 
        id, 
        amount, 
        created_at, 
        'unknown' AS payment_method,
        'completed' AS status
      FROM public.debt_payments
      UNION ALL
      SELECT 
        'merma' AS type, 
        id, 
        value AS amount, 
        date AS created_at, 
        'none' AS payment_method,
        'recorded' AS status
      FROM public.mermas;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err: any) {
    console.error("Error fetching expense transactions:", {
      message: err.message,
      stack: err.stack,
    });
    res.status(500).json({
      error: "Error fetching expense transactions",
      details:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Internal server error",
    });
  }
});

router.get("/credits", async (req, res) => {
  try {
    const query = `
      SELECT 
        c.id, 
        c.first_name, 
        c.last_name, 
        cr.balance,
        'credit' AS payment_method,
        CASE 
          WHEN cr.balance > 0 THEN 'pending'
          ELSE 'paid'
        END AS status
      FROM public.customers c
      JOIN public.credits cr ON c.id = cr.customer_id
      WHERE cr.balance > 0;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err: any) {
    console.error("Error fetching credits:", {
      message: err.message,
      stack: err.stack,
    });
    res.status(500).json({
      error: "Error fetching credits",
      details:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Internal server error",
    });
  }
});

router.get("/payable_credits", async (req, res) => {
  try {
    const query = `
      SELECT 
        s.id, 
        s.company_name, 
        sd.remaining_amount,
        'credit' AS payment_method,
        CASE 
          WHEN sd.remaining_amount > 0 THEN 'pending'
          ELSE 'paid'
        END AS status
      FROM public.suppliers s
      JOIN public.supplier_debts sd ON s.id = sd.supplier_id
      WHERE sd.remaining_amount > 0;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err: any) {
    console.error("Error fetching payable credits:", {
      message: err.message,
      stack: err.stack,
    });
    res.status(500).json({
      error: "Error fetching payable credits",
      details:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Internal server error",
    });
  }
});

router.get("/cash_registers", async (req, res) => {
  try {
    const query = `SELECT * FROM public.cash_registers;`;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching cash registers:", err);
    res.status(500).json({ error: "Error fetching cash registers" });
  }
});

// Productos más vendidos
router.get("/best_selling_products", async (req, res) => {
  try {
    const query = `
          SELECT
              p.id AS product_id,
              p.name AS product_name,
              s.id AS supplier_id,
              s.company_name AS supplier_name,
              SUM(ci.quantity) AS total_quantity_sold
          FROM public.cart_items ci
          JOIN public.products p ON ci.product_id = p.id
          LEFT JOIN public.suppliers s ON p.supplier_id = s.id
          GROUP BY p.id, s.id
          ORDER BY total_quantity_sold DESC
          LIMIT 10;
      `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching best selling products:", err);
    res.status(500).json({ error: "Error fetching best selling products" });
  }
});

// Clientes más frecuentes
router.get("/frequent_customers", async (req, res) => {
  try {
    const query = `
          SELECT
              c.id AS customer_id,
              c.first_name,
              c.last_name,
              COUNT(t.customer_id) AS transaction_count
          FROM public.transactions t
          JOIN public.customers c ON t.customer_id = c.id
          GROUP BY c.id
          ORDER BY transaction_count DESC
          LIMIT 10;
      `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching frequent customers:", err);
    res.status(500).json({ error: "Error fetching frequent customers" });
  }
});

// Productos con bajo stock
router.get("/low-stock", async (req, res) => {
  try {
    const queryLowStock = `
            SELECT 
                id,
                name,
                actual_stock,
                min_stock
            FROM public.products
            WHERE actual_stock <= min_stock
            ORDER BY actual_stock ASC
        `;
    
    const lowStockResult = await pool.query(queryLowStock);
    const lowStockProducts = lowStockResult.rows;

    if (lowStockProducts.length === 0) {
      return res.json({
        message: "No products with low stock found",
        products: []
      });
    }

    res.json({
      totalLowStock: lowStockProducts.length,
      products: lowStockProducts
    });
  } catch (err) {
    console.error("Error fetching low stock products:", err);
    res.status(500).json({ error: "Error retrieving low stock products" });
  }
});

// Frecuencia de compras por proveedores
router.get("/supplier-purchase-frequency", async (req, res) => {
  try {
    const querySupplierFrequency = `
            SELECT 
                s.id AS supplier_id,
                s.name AS supplier_name,
                COUNT(po.id) AS total_purchases,
                SUM(CASE WHEN po.payment_type = 'cash' THEN 1 ELSE 0 END) AS cash_purchases,
                SUM(CASE WHEN po.payment_type = 'credit' THEN 1 ELSE 0 END) AS credit_purchases,
                COALESCE(SUM(poi.quantity), 0) AS total_units_purchased,
                COALESCE(SUM(po.total_amount), 0) AS total_amount_spent
            FROM public.suppliers s
            LEFT JOIN public.purchase_orders po ON s.id = po.supplier_id
            LEFT JOIN public.purchase_order_items poi ON po.id = poi.purchase_order_id
            GROUP BY s.id, s.name
            ORDER BY total_purchases DESC
        `;
    
    const frequencyResult = await pool.query(querySupplierFrequency);
    const supplierFrequency = frequencyResult.rows;

    if (supplierFrequency.length === 0) {
      return res.json({
        message: "No purchase frequency data available",
        suppliers: []
      });
    }

    res.json({
      totalSuppliers: supplierFrequency.length,
      suppliers: supplierFrequency
    });
  } catch (err) {
    console.error("Error fetching supplier purchase frequency:", err);
    res.status(500).json({ error: "Error retrieving supplier purchase frequency" });
  }
});

// Generar reporte genérico en PDF
router.get("/pdf/:type", async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const doc = new PDFDocument();
    const filename = `reporte_${type}_${Date.now()}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    let data: any[];
    switch (type) {
      case "ventas":
        data = (
          await pool.query(`
            SELECT 
              t.id, 
              t.amount, 
              t.created_at, 
              t.type,
              CASE 
                WHEN t.type = 'credit' THEN 'pending'
                WHEN t.type = 'cash' THEN 'completed'
                ELSE 'unknown'
              END AS status,
              c.first_name, 
              c.last_name
            FROM transactions t
            LEFT JOIN customers c ON t.customer_id = c.id
            WHERE t.type = $1
          `, ["cash"])
        ).rows;
        break;
      case "inventario":
        data = (
          await pool.query(`
            SELECT 
              p.name, 
              p.actual_stock, 
              c.name as category,
              CASE 
                WHEN p.actual_stock <= p.min_stock THEN 'low'
                WHEN p.actual_stock = 0 THEN 'out_of_stock'
                ELSE 'in_stock'
              END AS status
            FROM products p
            JOIN categories c ON p.category_id = c.id
          `)
        ).rows;
        break;
      case "mermas":
        data = (
          await pool.query(`
            SELECT 
              m.*, 
              p.name as product_name,
              'recorded' AS status
            FROM mermas m
            JOIN products p ON m.product_id = p.id
          `)
        ).rows;
        break;
      default:
        return res.status(400).json({ error: "Tipo de reporte no válido" });
    }

    doc.pipe(res);
    doc.fontSize(18).text(`Reporte de ${type.toUpperCase()}`, { align: "center" });
    doc.moveDown();

    data.forEach((row: any, index: number) => {
      doc.fontSize(12).text(`${index + 1}. ID: ${row.id}`);
      if (row.amount) doc.text(`Monto: ${row.amount}`);
      if (row.created_at) doc.text(`Fecha: ${row.created_at}`);
      if (row.type) doc.text(`Tipo: ${row.type}`);
      if (row.status) doc.text(`Estado: ${row.status}`);
      if (row.first_name) doc.text(`Cliente: ${row.first_name} ${row.last_name || ''}`);
      if (row.name) doc.text(`Nombre: ${row.name}`);
      if (row.actual_stock) doc.text(`Stock: ${row.actual_stock}`);
      if (row.category) doc.text(`Categoría: ${row.category}`);
      if (row.product_name) doc.text(`Producto: ${row.product_name}`);
      doc.moveDown();
    });

    doc.end();
  } catch (error) {
    console.error("Error generando PDF:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Generar comando ESC/POS para impresoras térmicas
router.get("/thermal/:type", async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const device = new escpos.Network("192.168.1.100"); // IP de la impresora
    const printer = new escpos.Printer(device);

    // Obtener datos
    const { rows } = await pool.query(`SELECT * FROM ${type}_view`);

    // Configurar respuesta
    res.setHeader("Content-Type", "text/plain");

    device.open(() => {
      printer.align("CT").text(`REPORTE ${type.toUpperCase()}`).feed();

      rows.forEach((row: any) => {
        printer.text(`${row.id} - ${row.name}`).feed();
      });

      printer.cut().close();
      res.send("Comando enviado a impresora");
    });
  } catch (error) {
    console.error("Error ESC/POS:", error);
    res.status(500).json({ error: "Error de comunicación con impresora" });
  }
});

export default router;
