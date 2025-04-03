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

export default router;
