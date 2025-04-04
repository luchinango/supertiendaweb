import express, { Request, Response } from "express";
import { authenticate } from "../middleware/auth";
import pool from "../config/db";
import { Router } from "express";

const router: Router = express.Router();

// Middleware de autenticación
// router.use(authenticate);

// Reporte completo del inventario
router.get("/", async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT 
        p.id,
        p.name,
        p.sku,
        p.barcode,
        p.actual_stock,
        p.min_stock,
        p.max_stock,
        p.purchase_price,
        p.sale_price,
        p.unit,
        c.name AS category_name,
        s.name AS supplier_name,
        p.expiration_date,
        p.status,
        (p.actual_stock * p.purchase_price) AS total_value,
        CASE 
          WHEN p.actual_stock < p.min_stock THEN 'Bajo'
          WHEN p.actual_stock > p.max_stock THEN 'Exceso'
          ELSE 'Normal'
        END AS stock_status
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      ORDER BY p.name ASC
    `;

    const result = await pool.query(query);

    const summary = {
      total_products: result.rows.length,
      total_inventory_value: result.rows.reduce(
        (sum, product) => sum + (product.total_value || 0),
        0
      ),
      low_stock_count: result.rows.filter((p) => p.stock_status === "Bajo")
        .length,
      excess_stock_count: result.rows.filter((p) => p.stock_status === "Exceso")
        .length,
    };

    res.status(200).json({
      summary,
      products: result.rows,
      generated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error generating inventory report:", error);
    res.status(500).json({
      error: "Error al generar reporte de inventario",
      details: (error as Error).message,
    });
  }
});

// REPORT - Obtener reporte de inventario por rango de fechas
router.get("/by-date-range", async (req: Request, res: Response) => {
      try {
        const { start_date, end_date } = req.query as {
          start_date?: string;
          end_date?: string;
        };
  
        if (!start_date || !end_date) {
          return res.status(400).json({
            error: "Se requieren parámetros start_date y end_date",
          });
        }
  
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);
  
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          return res.status(400).json({
            error: "Fechas inválidas. Use formato ISO (YYYY-MM-DD)",
          });
        }
  
        if (startDate > endDate) {
          return res.status(400).json({
            error: "start_date debe ser anterior a end_date",
          });
        }
  
        const query = `
          SELECT 
            p.id,
            p.name,
            p.barcode,
            p.actual_stock,
            p.purchase_price,
            p.sale_price,
            c.name AS category_name,
            s.name AS supplier_name,
            p.expiration_date,
            (p.actual_stock * p.purchase_price) AS total_value
          FROM products p
          LEFT JOIN categories c ON p.category_id = c.id
          LEFT JOIN suppliers s ON p.supplier_id = s.id
          WHERE (p.expiration_date IS NULL OR p.expiration_date BETWEEN $1 AND $2)
          ORDER BY p.name ASC
        `;
  
        const result = await pool.query(query, [start_date, end_date]);
  
        const summary = {
          total_products: result.rows.length,
          total_inventory_value: result.rows.reduce(
            (sum, product) => sum + (product.total_value || 0),
            0
          ),
          date_range: {
            start: start_date,
            end: end_date,
          },
        };
  
        res.status(200).json({
          summary,
          products: result.rows,
          generated_at: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Error generating date range inventory report:", error);
        res.status(500).json({
          error: "Error al generar reporte por rango de fechas",
          details: (error as Error).message,
        });
      }
    }
  );

// REPORT - Obtener reporte de inventario por períodos
router.get("/by-period", async (req: Request, res: Response) => {
    try {
      const { period } = req.query as { period?: string };

      if (!period) {
        return res.status(400).json({
          error:
            "Se requiere parámetro period (daily, weekly, monthly, semiannual, annual)",
        });
      }

      const validPeriods = [
        "daily",
        "weekly",
        "monthly",
        "semiannual",
        "annual",
      ];
      if (!validPeriods.includes(period.toLowerCase())) {
        return res.status(400).json({
          error:
            "Período inválido. Use: daily, weekly, monthly, semiannual, annual",
        });
      }

      let dateFilter = "";
      switch (period.toLowerCase()) {
        case "daily":
          dateFilter = "DATE_TRUNC('day', CURRENT_DATE)";
          break;
        case "weekly":
          dateFilter = "DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '1 week'";
          break;
        case "monthly":
          dateFilter = "DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'";
          break;
        case "semiannual":
          dateFilter =
            "DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '6 months'";
          break;
        case "annual":
          dateFilter = "DATE_TRUNC('year', CURRENT_DATE) - INTERVAL '1 year'";
          break;
      }

      const query = `
        SELECT 
          p.id,
          p.name,
          p.barcode,
          p.actual_stock,
          p.purchase_price,
          p.sale_price,
          c.name AS category_name,
          s.name AS supplier_name,
          p.expiration_date,
          (p.actual_stock * p.purchase_price) AS total_value
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN suppliers s ON p.supplier_id = s.id
        WHERE (p.expiration_date IS NULL OR p.expiration_date >= ${dateFilter})
        ORDER BY p.name ASC
      `;

      const result = await pool.query(query);

      const summary = {
        total_products: result.rows.length,
        total_inventory_value: result.rows.reduce(
          (sum, product) => sum + (product.total_value || 0),
          0
        ),
        period: period.toLowerCase(),
      };

      res.status(200).json({
        summary,
        products: result.rows,
        generated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error generating period inventory report:", error);
      res.status(500).json({
        error: "Error al generar reporte por período",
        details: (error as Error).message,
      });
    }
  }
);

// Estadísticas de movimientos del negocio
router.get('/business-stats', async (req: Request, res: Response) => {
    try {
      const { start_date, end_date } = req.query as { start_date?: string; end_date?: string };
  
      // Validar fechas (opcional)
      let dateFilter = '';
      const queryParams: string[] = [];
      if (start_date && end_date) {
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          return res.status(400).json({ error: 'Fechas inválidas. Use formato ISO (YYYY-MM-DD)' });
        }
        if (startDate > endDate) {
          return res.status(400).json({ error: 'start_date debe ser anterior a end_date' });
        }
        dateFilter = 'WHERE t.created_at BETWEEN $1 AND $2';
        queryParams.push(start_date, end_date);
      }
  
      // Consulta para estadísticas de ventas
      const salesQuery = `
        SELECT 
          COUNT(*) as total_sales,
          SUM(amount) as total_sales_amount
        FROM transactions t
        ${dateFilter}
      `;
      const salesResult = await pool.query(salesQuery, queryParams);
  
      // Consulta para estadísticas de compras
      const purchasesQuery = `
        SELECT 
          COUNT(*) as total_purchases,
          SUM(total_amount) as total_purchases_amount
        FROM purchase_orders po
        ${dateFilter.replace('t.created_at', 'po.order_date')}
      `;
      const purchasesResult = await pool.query(purchasesQuery, queryParams);
  
      // Consulta para productos más vendidos (usando cart_items)
      const topProductsQuery = `
        SELECT 
          p.name,
          p.barcode,
          SUM(ci.quantity * ci.price_at_time) as total_sold_amount,
          SUM(ci.quantity) as total_quantity_sold
        FROM transactions t
        JOIN cart c ON t.cart_id = c.id
        JOIN cart_items ci ON ci.cart_id = c.id
        JOIN products p ON ci.product_id = p.id
        ${dateFilter}
        GROUP BY p.id, p.name, p.barcode
        ORDER BY total_sold_amount DESC
        LIMIT 5
      `;
      const topProductsResult = await pool.query(topProductsQuery, queryParams);
  
      // Consulta para productos con más mermas (usando mermas.date)
      const topMermasQuery = `
        SELECT 
          p.name,
          p.barcode,
          SUM(m.quantity) as total_merma_quantity
        FROM mermas m
        JOIN products p ON m.product_id = p.id
        ${dateFilter.replace('t.created_at', 'm.date')}
        GROUP BY p.id, p.name, p.barcode
        ORDER BY total_merma_quantity DESC
        LIMIT 5
      `;
      const topMermasResult = await pool.query(topMermasQuery, queryParams);
  
      // Calcular totales y porcentajes
      const salesAmount = parseFloat(salesResult.rows[0].total_sales_amount || '0');
      const purchasesAmount = parseFloat(purchasesResult.rows[0].total_purchases_amount || '0');
      const totalMovements = salesAmount + purchasesAmount; // Base para porcentajes
      const netIncome = salesAmount - purchasesAmount;
  
      const salesPercentage = totalMovements > 0 ? (salesAmount / totalMovements) * 100 : 0;
      const purchasesPercentage = totalMovements > 0 ? (purchasesAmount / totalMovements) * 100 : 0;
  
      // Preparar datos para gráficos
      const chartData = {
        movements: {
          labels: ['Ventas', 'Compras'],
          datasets: [
            {
              label: 'Monto ($)',
              data: [salesAmount, purchasesAmount],
              backgroundColor: ['#36A2EB', '#FF6384'],
            },
            {
              label: 'Porcentaje (%)',
              data: [salesPercentage, purchasesPercentage],
              backgroundColor: ['#36A2EB', '#FF6384'],
            },
          ],
        },
        top_selling_products: {
          labels: topProductsResult.rows.map((p: any) => p.name),
          datasets: [
            {
              label: 'Monto Vendido ($)',
              data: topProductsResult.rows.map((p: any) => parseFloat(p.total_sold_amount)),
              backgroundColor: '#4BC0C0',
            },
            {
              label: 'Cantidad Vendida',
              data: topProductsResult.rows.map((p: any) => parseFloat(p.total_quantity_sold)),
              backgroundColor: '#36A2EB',
            },
          ],
        },
        top_merma_products: {
          labels: topMermasResult.rows.map((m: any) => m.name),
          datasets: [
            {
              label: 'Cantidad Merma',
              data: topMermasResult.rows.map((m: any) => parseFloat(m.total_merma_quantity)),
              backgroundColor: '#FFCE56',
            },
          ],
        },
      };
  
      // Respuesta
      const stats = {
        sales: {
          total_count: parseInt(salesResult.rows[0].total_sales || '0'),
          total_amount: salesAmount,
          percentage: parseFloat(salesPercentage.toFixed(2)),
        },
        purchases: {
          total_count: parseInt(purchasesResult.rows[0].total_purchases || '0'),
          total_amount: purchasesAmount,
          percentage: parseFloat(purchasesPercentage.toFixed(2)),
        },
        net_income: netIncome,
        top_selling_products: topProductsResult.rows.map((p: any) => ({
          name: p.name,
          barcode: p.barcode,
          total_sold_amount: parseFloat(p.total_sold_amount),
          total_quantity_sold: parseInt(p.total_quantity_sold),
        })),
        top_merma_products: topMermasResult.rows.map((m: any) => ({
          name: m.name,
          barcode: m.barcode,
          total_merma_quantity: parseFloat(m.total_merma_quantity),
        })),
        period: start_date && end_date ? { start: start_date, end: end_date } : 'all_time',
        generated_at: new Date().toISOString(),
        chart_data: chartData,
      };
  
      res.status(200).json(stats);
    } catch (error) {
      console.error('Error generating business stats:', error);
      res.status(500).json({
        error: 'Error al generar estadísticas del negocio',
        details: (error as Error).message,
      });
    }
  });

export default router;
