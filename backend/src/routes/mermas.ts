import express, { Request, Response } from 'express';
import axios from 'axios';
import pool from '../config/db';
import authMiddleware from '../middleware/auth';
import { Merma, MermaWithDetails } from '../models/mermas';
import { User } from '../models/user';

const router = express.Router();

// router.use(authMiddleware.authenticate);

const checkExpiredProducts = async () => {
  const response = await axios.post('http://localhost:5000/api/mermas/check-expired', {}, {
    headers: { Authorization: `Bearer ${process.env.ADMIN_TOKEN}` },
  });
};

checkExpiredProducts().catch(console.error);

// Crear una merma manualmente
router.post('/', async (req: Request, res: Response) => {
    const { product_id, quantity, type, date, value, responsible_id, observations }: Merma = req.body;

    try {
        await pool.query('BEGIN');

        const productResult = await pool.query('SELECT actual_stock, sale_price FROM products WHERE id = $1', [product_id]);
        const product = productResult.rows[0];
        if (!product) {
            throw new Error('Producto no encontrado');
        }
        if (product.actual_stock < quantity) {
            throw new Error('Stock insuficiente');
        }

        const mermaValue = value || product.sale_price * quantity;

        const mermaResult = await pool.query(
            `INSERT INTO mermas (product_id, quantity, type, date, value, responsible_id, observations)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
            [product_id, quantity, type, date, mermaValue, responsible_id, observations]
        );
        const mermaId = mermaResult.rows[0].id;

        const kardexResult = await pool.query(
            `INSERT INTO kardex (product_id, movement_type, quantity, unit_price, reference_id, reference_type, stock_after)
             VALUES ($1, 'exit', $2, $3, $4, 'merma', $5) RETURNING id`,
            [product_id, quantity, product.sale_price, mermaId, product.actual_stock - quantity]
        );
        const kardexId = kardexResult.rows[0].id;

        await pool.query('UPDATE mermas SET kardex_id = $1 WHERE id = $2', [kardexId, mermaId]);
        await pool.query('UPDATE products SET actual_stock = actual_stock - $1 WHERE id = $2', [quantity, product_id]);

        await pool.query('COMMIT');
        res.status(201).json({ message: 'Merma registrada exitosamente', mermaId });
    } catch (error) {
        await pool.query('ROLLBACK');
        res.status(400).json({ error: (error as Error).message });
    }
});

// Listar todas las mermas
router.get('/', async (_req: Request, res: Response) => {
    try {
        const result = await pool.query(`
            SELECT m.*, p.name AS product_name, u.username AS responsible_name
            FROM mermas m
            LEFT JOIN products p ON m.product_id = p.id
            LEFT JOIN users u ON m.responsible_id = u.id
            ORDER BY m.date DESC
        `);
        const mermas: MermaWithDetails[] = result.rows;
        res.json(mermas);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Eliminar una merma
router.delete('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        await pool.query('BEGIN');

        const mermaResult = await pool.query('SELECT product_id, quantity, kardex_id FROM mermas WHERE id = $1', [id]);
        const merma = mermaResult.rows[0];
        if (!merma) {
            throw new Error('Merma no encontrada');
        }
        const { product_id, quantity, kardex_id } = merma;

        await pool.query('DELETE FROM mermas WHERE id = $1', [id]);
        if (kardex_id) {
            await pool.query('DELETE FROM kardex WHERE id = $1', [kardex_id]);
        }
        await pool.query('UPDATE products SET actual_stock = actual_stock + $1 WHERE id = $2', [quantity, product_id]);

        await pool.query('COMMIT');
        res.json({ message: 'Merma eliminada exitosamente' });
    } catch (error) {
        await pool.query('ROLLBACK');
        res.status(400).json({ error: (error as Error).message });
    }
});

// Verificar y registrar mermas por vencimiento
router.post('/check-expired', async (req: Request, res: Response) => {
  console.log('Endpoint /check-expired llamado'); // Para depuración
  const currentDate = new Date().toISOString().split('T')[0]; // Fecha actual en formato YYYY-MM-DD

  try {
      await pool.query('BEGIN');

      const expiredProductsResult = await pool.query(`
          SELECT id, name, actual_stock, sale_price, expiration_date, shelf_life_days
          FROM products
          WHERE actual_stock > 0
          AND (expiration_date <= $1 OR expiration_date IS NOT NULL)
      `, [currentDate]);

      const expiredProducts = expiredProductsResult.rows;
      const mermasRegistradas: { product_id: number; quantity: number }[] = [];

      for (const product of expiredProducts) {
          let quantityToRemove = product.actual_stock;

          if (!product.expiration_date && product.shelf_life_days) {
              const lastEntry = await pool.query(`
                  SELECT movement_date
                  FROM kardex
                  WHERE product_id = $1 AND movement_type = 'entry'
                  ORDER BY movement_date DESC
                  LIMIT 1
              `, [product.id]);

              if (lastEntry.rows.length > 0) {
                  const entryDate = new Date(lastEntry.rows[0].movement_date);
                  const expirationThreshold = new Date(entryDate);
                  expirationThreshold.setDate(entryDate.getDate() + product.shelf_life_days);

                  if (expirationThreshold <= new Date()) {
                      const mermaValue = product.sale_price * quantityToRemove;

                      const mermaResult = await pool.query(
                          `INSERT INTO mermas (product_id, quantity, type, date, value, observations, is_automated)
                           VALUES ($1, $2, 'vencido', $3, $4, $5, true) RETURNING id`,
                          [product.id, quantityToRemove, currentDate, mermaValue, `Producto vencido automáticamente (duración: ${product.shelf_life_days} días)`]
                      );
                      const mermaId = mermaResult.rows[0].id;

                      const kardexResult = await pool.query(
                          `INSERT INTO kardex (product_id, movement_type, quantity, unit_price, reference_id, reference_type, stock_after)
                           VALUES ($1, 'exit', $2, $3, $4, 'merma', $5) RETURNING id`,
                          [product.id, quantityToRemove, product.sale_price, mermaId, 0]
                      );
                      const kardexId = kardexResult.rows[0].id;

                      await pool.query('UPDATE mermas SET kardex_id = $1 WHERE id = $2', [kardexId, mermaId]);
                      await pool.query('UPDATE products SET actual_stock = 0 WHERE id = $1', [product.id]);

                      mermasRegistradas.push({ product_id: product.id, quantity: quantityToRemove });
                  }
              }
          } else if (product.expiration_date && new Date(product.expiration_date) <= new Date()) {
              const mermaValue = product.sale_price * quantityToRemove;

              const mermaResult = await pool.query(
                  `INSERT INTO mermas (product_id, quantity, type, date, value, observations, is_automated)
                   VALUES ($1, $2, 'vencido', $3, $4, $5, true) RETURNING id`,
                  [product.id, quantityToRemove, currentDate, mermaValue, `Producto vencido automáticamente (fecha: ${product.expiration_date})`]
              );
              const mermaId = mermaResult.rows[0].id;

              const kardexResult = await pool.query(
                  `INSERT INTO kardex (product_id, movement_type, quantity, unit_price, reference_id, reference_type, stock_after)
                   VALUES ($1, 'exit', $2, $3, $4, 'merma', $5) RETURNING id`,
                  [product.id, quantityToRemove, product.sale_price, mermaId, 0]
              );
              const kardexId = kardexResult.rows[0].id;

              await pool.query('UPDATE mermas SET kardex_id = $1 WHERE id = $2', [kardexId, mermaId]);
              await pool.query('UPDATE products SET actual_stock = 0 WHERE id = $1', [product.id]);

              mermasRegistradas.push({ product_id: product.id, quantity: quantityToRemove });
          }
      }

      await pool.query('COMMIT');
      res.json({
          message: 'Revisión de productos vencidos completada',
          mermasRegistradas,
      });
  } catch (error) {
      await pool.query('ROLLBACK');
      res.status(500).json({ error: (error as Error).message });
  }
});

// Reportes de mermas
router.get('/report', async (_req: Request, res: Response) => {
    try {
        const result = await pool.query(`
            SELECT 
                SUM(quantity) AS total_mermas,
                SUM(CASE WHEN type = 'vencido' THEN quantity ELSE 0 END) AS total_vencidos,
                SUM(CASE WHEN type = 'dañado' THEN quantity ELSE 0 END) AS total_dañados,
                SUM(CASE WHEN type = 'perdido' THEN quantity ELSE 0 END) AS total_perdidos,
                json_agg(
                    json_build_object(
                        'id', m.id,
                        'product_id', m.product_id,
                        'product_name', p.name,
                        'quantity', m.quantity,
                        'type', m.type,
                        'date', m.date,
                        'value', m.value,
                        'responsible_name', u.username,
                        'observations', m.observations
                    )
                ) AS mermas_detalladas
            FROM mermas m
            LEFT JOIN products p ON m.product_id = p.id
            LEFT JOIN users u ON m.responsible_id = u.id
        `);

        const report = result.rows[0];
        res.json({
            total_mermas: report.total_mermas || 0,
            total_vencidos: report.total_vencidos || 0,
            total_dañados: report.total_dañados || 0,
            total_perdidos: report.total_perdidos || 0,
            mermas_detalladas: report.mermas_detalladas || []
        });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

export default router;