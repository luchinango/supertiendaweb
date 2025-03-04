import { Router, Request, Response } from "express";
import express from "express";
import pool from "../config/db";
import { authenticate } from "../middleware/auth";
import bcrypt from "bcrypt";
import { getUserByEmail } from "../models/user";
import { generateToken } from "../middleware/auth";

const router: Router = express.Router();

interface Customer {
  id?: number;
  first_name: string;
  last_name: string;
  company_name?: string;
  tax_id?: string;
  address?: string;
  phone?: string;
  email?: string;
  status?: string;
}

// Login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await getUserByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const token = generateToken(user);
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// CREATE - Crear cliente
router.post("/", authenticate, async (req: Request, res: Response) => {
  try {
    const {
      first_name,
      last_name,
      company_name,
      tax_id,
      address,
      phone,
      email,
    }: Customer = req.body;

    if (!first_name || !last_name) {
      return res
        .status(400)
        .json({ error: "Nombre y apellido son requeridos" });
    }

    const result = await pool.query(
      `INSERT INTO customers 
       (first_name, last_name, company_name, tax_id, address, phone, email, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'active') 
       RETURNING *`,
      [first_name, last_name, company_name, tax_id, address, phone, email]
    );

    const customerId = result.rows[0].id;

    // Crear crédito inicial con saldo cero
    await pool.query(
      `INSERT INTO credits (customer_id, balance, credit_limit, status)
       VALUES ($1, $2, $3, 'active')`,
      [result.rows[0].id, 0.0, 0.0]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// READ - Obtener todos los clientes (solo usuarios autorizados)
router.get("/", async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    let query = `SELECT * FROM customers WHERE status = 'active'`;
    const params = [];

    if (search) {
      query += ` AND (first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1)`;
      params.push(`%${search}%`);
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// READ - Obtener cliente específico con crédito
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT 
  public.credits.balance,
  public.credits.credit_limit,
  public.credits.id
FROM
  public.credits
  INNER JOIN public.customers ON (public.credits.customer_id = public.customers.id)
WHERE
  public.customers.status = 'active' AND 
  public.customers.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// UPDATE - Actualizar cliente
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates: Customer = req.body;

    const result = await pool.query(
      `UPDATE customers SET
       first_name = $1,
       last_name = $2,
       company_name = $3,
       tax_id = $4,
       address = $5,
       phone = $6,
       email = $7
       WHERE id = $8
       RETURNING *`,
      [
        updates.first_name,
        updates.last_name,
        updates.company_name,
        updates.tax_id,
        updates.address,
        updates.phone,
        updates.email,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// DELETE - Desactivar cliente
router.delete("/delete/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await pool.query("BEGIN");

    // Desactivar cliente
    await pool.query(`UPDATE customers SET status = 'inactive' WHERE id = $1`, [
      id,
    ]);

    // Congelar crédito
    await pool.query(
      `UPDATE credits SET status = 'frozen' WHERE customer_id = $1`,
      [id]
    );

    await pool.query("COMMIT");

    res.json({ message: "Cliente desactivado y crédito congelado" });
  } catch (error) {
    await pool.query("ROLLBACK");
    res.status(500).json({ error: (error as Error).message });
  }
});

// Gestión de Crédito Prepago
router.post("/:id/credit/topup", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, reference } = req.body;
    const user_id = req.user?.id; // Obtén el user_id del middleware de autenticación

    /* if (!user_id) {
      return res.status(401).json({ error: "Acceso no autorizado" });
    } */

    // Resto de validaciones y lógica...

    await pool.query("BEGIN");

    const credit = await pool.query(
      `UPDATE credits 
       SET balance = balance + $1
       WHERE customer_id = $2
       RETURNING *`,
      [amount, id]
    );

    // Inserción corregida con user_id
    await pool.query(
      `INSERT INTO transactions 
       (customer_id, user_id, amount, type, reference)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, user_id, amount, "deposit", reference]
    );

    await pool.query("COMMIT");

    res.json({
      message: "Recarga exitosa",
      new_balance: credit.rows[0].balance,
    });
  } catch (error) {
    await pool.query("ROLLBACK");
    res.status(500).json({ error: (error as Error).message });
  }
});

// Uso de crédito
router.post("/:id/credit/use", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, invoice_number } = req.body;

    const credit = await pool.query(
      `SELECT balance FROM credits WHERE customer_id = $1 FOR UPDATE`,
      [id]
    );

    if (credit.rows[0].balance < amount) {
      return res.status(400).json({ error: "Saldo insuficiente" });
    }

    await pool.query("BEGIN");

    // Descontar saldo
    await pool.query(
      `UPDATE credits SET balance = balance - $1 WHERE customer_id = $2`,
      [amount, id]
    );

    // Registrar transacción
    await pool.query(
      `INSERT INTO transactions 
       (customer_id, amount, type, reference)
       VALUES ($1, $2, 'payment', $3)`,
      [id, amount, invoice_number]
    );

    await pool.query("COMMIT");

    res.json({
      message: "Pago realizado con crédito",
      remaining_balance: credit.rows[0].balance - amount,
    });
  } catch (error) {
    await pool.query("ROLLBACK");
    res.status(500).json({ error: (error as Error).message });
  }
});

// Historial de transacciones
router.get("/:id/credit/history", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { limit = 10, offset = 0 } = req.query;

    const history = await pool.query(
      `SELECT * FROM credit_transactions
       WHERE customer_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [id, limit, offset]
    );

    res.json(history.rows);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
