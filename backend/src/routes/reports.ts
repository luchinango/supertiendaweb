import { Router, Request, Response } from "express";
import pool from "../config/db";
import { authenticate, authorize } from "../middleware/auth";
import PDFDocument from 'pdfkit';
import escpos from 'escpos';

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

    // Productos vendidos (usando cart_items y uniendo con transactions)
    const queryProducts = `
            SELECT 
            COALESCE(SUM(ci.quantity), 0) AS products_sold
            FROM public.cart_items ci
            JOIN public.cart c ON ci.cart_id = c.id
            JOIN public.transactions t ON c.id = t.cart_id
            WHERE t.created_at >= NOW() - INTERVAL '1 month'
        `;
    const productsResult = await pool.query(queryProducts);
    const productsSold = productsResult.rows[0]?.products_sold || 0;

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
      const totalExpenses = result.rows.reduce((sum, row) => sum + parseFloat(row.total_expenses || row.sum), 0);
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

        let query = `SELECT * FROM public.transactions`;
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
                semiannual: "DATE_TRUNC('month', created_at) >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '6 months') AND DATE_TRUNC('month', created_at) <= DATE_TRUNC('month', CURRENT_DATE)",
                yearly: "DATE_TRUNC('year', created_at) = DATE_TRUNC('year', CURRENT_DATE)"
            };

            const periodLower = period.toLowerCase();
            if (periodConditions[periodLower]) {
                query += startDate || endDate ? ` AND ` : ` WHERE `;
                query += periodConditions[periodLower];
            } else {
                throw new Error(`Invalid period value. Valid options: ${Object.keys(periodConditions).join(', ')}`);
            }
        }

        query += ` ORDER BY created_at ASC;`;

        console.log('Query:', query);
        console.log('Params:', queryParams);

        const result = await pool.query(query, queryParams);
        res.json(result.rows);
    } catch (err: any) {
        console.error("Error fetching transactions:", {
            message: err.message,
            stack: err.stack,
            queryParams: req.query
        });
        res.status(500).json({ 
            error: "Error fetching transactions",
            details: err.message 
        });
    }
});

router.get("/transactions/income", async (req, res) => {
  try {
      const query = `SELECT * FROM public.transactions WHERE type IN ('cash', 'credit');`;
      const result = await pool.query(query);
      res.json(result.rows);
  } catch (err) {
      console.error("Error fetching income transactions:", err);
      res.status(500).json({ error: "Error fetching income transactions" });
  }
});

router.get("/transactions/expenses", async (req, res) => {
  try {
      const query = `
          SELECT 'purchase_order' AS type, id, total_amount AS amount, created_at FROM public.purchase_orders
          UNION ALL
          SELECT 'debt_payment' AS type, id, amount, created_at FROM public.debt_payments
          UNION ALL
          SELECT 'merma' AS type, id, value AS amount, date AS created_at FROM public.mermas;
      `;
      const result = await pool.query(query);
      res.json(result.rows);
  } catch (err) {
      console.error("Error fetching expense transactions:", err);
      res.status(500).json({ error: "Error fetching expense transactions" });
  }
});

router.get("/credits", async (req, res) => {
  try {
      const query = `
          SELECT c.id, c.first_name, c.last_name, cr.balance
          FROM public.customers c
          JOIN public.credits cr ON c.id = cr.customer_id
          WHERE cr.balance > 0;
      `;
      const result = await pool.query(query);
      res.json(result.rows);
  } catch (err) {
      console.error("Error fetching credits:", err);
      res.status(500).json({ error: "Error fetching credits" });
  }
});

// Cuentas por pagar
router.get("/payable_credits", async (req, res) => {
    try {
        const query = `
            SELECT s.id, s.company_name, sd.remaining_amount
            FROM public.suppliers s
            JOIN public.supplier_debts sd ON s.id = sd.supplier_id
            WHERE sd.remaining_amount > 0;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching payable credits:", err);
        res.status(500).json({ error: "Error fetching payable credits" });
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

// Generar reporte genérico en PDF
router.get('/pdf/:type', async (req: Request, res: Response) => {
    try {
        const { type } = req.params;
        const doc = new PDFDocument();
        const filename = `reporte_${type}_${Date.now()}.pdf`;

        // Configurar headers para descarga
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        // Consultar datos según tipo de reporte
        let data: any[];
        switch (type) {
            case 'ventas':
                data = (await pool.query('SELECT * FROM transactions WHERE type = $1', ['cash'])).rows;
                break;
            case 'inventario':
                data = (await pool.query(`
                    SELECT p.name, p.actual_stock, c.name as category 
                    FROM products p
                    JOIN categories c ON p.category_id = c.id
                `)).rows;
                break;
            case 'mermas':
                data = (await pool.query(`
                    SELECT m.*, p.name as product_name 
                    FROM mermas m
                    JOIN products p ON m.product_id = p.id
                `)).rows;
                break;
            default:
                return res.status(400).json({ error: 'Tipo de reporte no válido' });
        }

        // Generar contenido PDF
        doc.pipe(res);
        doc.fontSize(18).text(`Reporte de ${type.toUpperCase()}`, { align: 'center' });
        doc.moveDown();
        
        data.forEach((row: any, index: number) => {
            doc.fontSize(12).text(`${index + 1}. ${JSON.stringify(row)}`);
            doc.moveDown();
        });

        doc.end();
    } catch (error) {
        console.error('Error generando PDF:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Generar comando ESC/POS para impresoras térmicas
router.get('/thermal/:type',  async (req: Request, res: Response) => {
    try {
        const { type } = req.params;
        const device = new escpos.Network('192.168.1.100');  // IP de la impresora
        const printer = new escpos.Printer(device);

        // Obtener datos
        const { rows } = await pool.query(`SELECT * FROM ${type}_view`);
        
        // Configurar respuesta
        res.setHeader('Content-Type', 'text/plain');
        
        device.open(() => {
            printer
                .align('CT')
                .text(`REPORTE ${type.toUpperCase()}`)
                .feed();

            rows.forEach((row: any) => {
                printer.text(`${row.id} - ${row.name}`).feed();
            });

            printer.cut().close();
            res.send('Comando enviado a impresora');
        });
    } catch (error) {
        console.error('Error ESC/POS:', error);
        res.status(500).json({ error: 'Error de comunicación con impresora' });
    }
});

export default router;
