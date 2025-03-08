import { Router, Request, Response } from "express";
import express from "express";
import pool from "../config/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router: Router = express.Router();

interface User {
  id?: number;
  username: string;
  password: string;
  email: string;
  first_name: string;
  last_name: string;
  address?: string;
  mobile_phone?: string;
  role_id: number;
  created_at?: Date;
  status?: string;
}

interface SupplierDebt {
  id?: number;
  supplier_id: number;
  user_id: number; // Usuario que realiza la compra
  amount: number;
  created_at?: Date;
  updated_at?: Date;
}

interface DebtPayment {
  id?: number;
  debt_id: number;
  amount: number;
  payment_date?: Date;
}

interface Consignment {
  id?: number;
  supplier_id: number;
  user_id: number; // Usuario que registra la consignación
  created_at?: Date;
  updated_at?: Date;
  status?: string;
}

interface ConsignmentItem {
  id?: number;
  consignment_id: number;
  product_id: number;
  quantity_sent: number;
  quantity_sold: number;
  quantity_returned: number;
}

const SALT_ROUNDS = 10;

// Middleware para verificar JWT (opcional)
const authenticateToken = (req: Request, res: Response, next: Function) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    (req as any).user = user;
    next();
  });
};

// LOGIN
router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await pool.query(
      `SELECT u.*, r.name AS role
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.email = $1 AND u.status = $2`,
      [email, "active"]
    );

    // Verificar si el usuario existe
    if (user.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Usuario no existe o está inactivo" });
    }

    const isValidPassword = await bcrypt.compare(
      password,
      user.rows[0].password
    );
    if (!isValidPassword) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      { id: user.rows[0].id, role: user.rows[0].role }, // Usamos 'role' para consistencia con auth.ts
      process.env.JWT_SECRET || "clave_secreta_para_desarrollo", // Aseguramos un valor por defecto
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// CREATE - Registrar un usuario
router.post("/register", async (req: Request, res: Response) => {
  try {
    const {
      username,
      password,
      email,
      first_name,
      last_name,
      address,
      mobile_phone,
      role_id,
    } = req.body;

    if (!role_id) {
      return res.status(400).json({ error: "El campo role_id es obligatorio" });
    }

    const hashedPassword = await bcrypt.hash(password || "", SALT_ROUNDS);

    const result = await pool.query(
      `INSERT INTO users (username, password, email, first_name, last_name, address, mobile_phone, role_id, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        username,
        hashedPassword,
        email,
        first_name,
        last_name,
        address,
        mobile_phone,
        role_id,
        "active",
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// READ - Obtener todos los usuarios
router.get("/", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT u.*, r.name as role
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// READ - Obtener un usuario por ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT 
  public.users.id,
  public.users.username,
  public.users.password,
  public.users.email,
  public.users.first_name,
  public.users.last_name,
  public.users.address,
  public.users.mobile_phone,
  public.users.role_id,
  public.users.parent_user_id,
  public.users.created_at,
  public.users.status
FROM
  public.users
WHERE
  public.users.id = $1 AND 
  public.users.status = 'active'`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// UPDATE - Actualizar un usuario (PUT)
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      username,
      password,
      email,
      first_name,
      last_name,
      address,
      mobile_phone,
      role_id,
    }: Partial<User> = req.body;

    let hashedPassword = password;
    if (password) {
      hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    }

    const result = await pool.query(
      `UPDATE users SET username = $1, password = $2, email = $3, first_name = $4, last_name = $5, address = $6, mobile_phone = $7, role_id = $8
       WHERE id = $9 RETURNING *`,
      [
        username,
        hashedPassword,
        email,
        first_name,
        last_name,
        address,
        mobile_phone,
        role_id,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// PATCH - Actualizar parcialmente un usuario
router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates: Partial<User> = req.body;

    const existingUser = await pool.query("SELECT * FROM users WHERE id = $1", [
      id,
    ]);
    if (existingUser.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const fields = Object.keys(updates).filter(
      (key) => key !== "id" && key !== "created_at" && key !== "status"
    );
    if (fields.length === 0) {
      return res.status(400).json({ error: "No updates provided" });
    }

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, SALT_ROUNDS);
    }

    const setClause = fields
      .map((field, index) => `${field} = $${index + 1}`)
      .join(", ");
    const values = fields.map((field) => updates[field as keyof Partial<User>]);

    const result = await pool.query(
      `UPDATE users SET ${setClause} WHERE id = $${
        fields.length + 1
      } RETURNING *`,
      [...values, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// DELETE - Desactivar un usuario
router.post("/delete/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE users SET status = 'inactive' WHERE id = $1 RETURNING id, username, status`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res
      .status(200)
      .json({ message: "Usuario desactivado", data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// GESTIÓN DE CRÉDITOS ENTRE USER Y SUPPLIER
// Registrar una compra a crédito con un supplier
router.post(
  "/users/:userId/suppliers/:supplierId/debts",
  async (req: Request, res: Response) => {
    try {
      const { userId, supplierId } = req.params;
      const { amount, products } = req.body; // products: [{ product_id, quantity, price }]

      if (!amount || isNaN(amount)) {
        return res.status(400).json({ error: "Amount must be a valid number" });
      }

      const userCheck = await pool.query(
        "SELECT * FROM users WHERE id = $1 AND status = $2",
        [userId, "active"]
      );
      if (userCheck.rows.length === 0) {
        return res.status(404).json({ error: "User not found or inactive" });
      }

      const supplierCheck = await pool.query(
        "SELECT * FROM suppliers WHERE id = $1",
        [supplierId]
      );
      if (supplierCheck.rows.length === 0) {
        return res.status(404).json({ error: "Supplier not found" });
      }

      // Registrar la deuda
      const debtResult = await pool.query(
        "INSERT INTO supplier_debts (supplier_id, user_id, amount, remaining_amount, created_at, updated_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *",
        [supplierId, userId, amount, amount] // remaining_amount inicialmente igual a amount
      );

      // Actualizar el stock de productos (si se proporcionan)
      if (products && Array.isArray(products)) {
        for (const product of products) {
          await pool.query(
            "UPDATE products SET stock = stock + $1 WHERE id = $2",
            [product.quantity, product.product_id]
          );
        }
      }

      res
        .status(201)
        .json({ message: "Debt created", debt: debtResult.rows[0] });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
);

// Registrar un pago en cuotas de una deuda
router.post(
  "/users/:userId/suppliers/:supplierId/debts/:debtId/payments",
  async (req: Request, res: Response) => {
    try {
      const { userId, supplierId, debtId } = req.params;
      const { amount } = req.body;

      if (!amount || isNaN(amount)) {
        return res.status(400).json({ error: "Amount must be a valid number" });
      }

      const debtCheck = await pool.query(
        "SELECT * FROM supplier_debts WHERE id = $1 AND supplier_id = $2 AND user_id = $3",
        [debtId, supplierId, userId]
      );
      if (debtCheck.rows.length === 0) {
        return res.status(404).json({ error: "Debt not found" });
      }

      const currentDebt = debtCheck.rows[0];
      if (currentDebt.amount < amount) {
        return res
          .status(400)
          .json({ error: "Payment amount exceeds remaining debt" });
      }

      // Registrar el pago
      const paymentResult = await pool.query(
        "INSERT INTO debt_payments (debt_id, amount, created_at) VALUES ($1, $2, CURRENT_TIMESTAMP) RETURNING *",
        [debtId, amount]
      );

      // Actualizar el monto de la deuda
      await pool.query(
        "UPDATE supplier_debts SET amount = amount - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
        [amount, debtId]
      );

      res
        .status(201)
        .json({ message: "Payment recorded", payment: paymentResult.rows[0] });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
);

// Obtener todas las deudas de un usuario con suppliers
router.get("/users/:userId/debts", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `SELECT sd.*, s.name as supplier_name,
              (SELECT SUM(amount) FROM debt_payments dp WHERE dp.debt_id = sd.id) as total_paid
       FROM supplier_debts sd
       JOIN suppliers s ON sd.supplier_id = s.id
       WHERE sd.user_id = $1`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// GESTIÓN DE CONSIGNACIONES (OPCIONAL)
// Registrar una consignación
router.post(
  "/users/:userId/suppliers/:supplierId/consignments",
  async (req: Request, res: Response) => {
    try {
      const { userId, supplierId } = req.params;
      const { items, end_date } = req.body; // items: [{ product_id, quantity_sent }], end_date opcional

      // Validar entrada
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res
          .status(400)
          .json({ error: "Items must be a non-empty array" });
      }
      for (const item of items) {
        if (
          !item.product_id ||
          !item.quantity_sent ||
          isNaN(item.quantity_sent)
        ) {
          return res
            .status(400)
            .json({
              error: "Each item must have a valid product_id and quantity_sent",
            });
        }
      }

      const userCheck = await pool.query(
        "SELECT * FROM users WHERE id = $1 AND status = $2",
        [userId, "active"]
      );
      if (userCheck.rows.length === 0) {
        return res.status(404).json({ error: "User not found or inactive" });
      }

      const supplierCheck = await pool.query(
        "SELECT * FROM suppliers WHERE id = $1",
        [supplierId]
      );
      if (supplierCheck.rows.length === 0) {
        return res.status(404).json({ error: "Supplier not found" });
      }

      // Calcular total_value basado en los ítems
      let totalValue = 0;
      const productIds = items.map((item) => item.product_id);
      const productsResult = await pool.query(
        "SELECT id, price FROM products WHERE id = ANY($1)",
        [productIds]
      );
      const products = productsResult.rows.reduce((acc, product) => {
        acc[product.id] = product.price;
        return acc;
      }, {});

      for (const item of items) {
        const price = products[item.product_id];
        if (!price) {
          return res
            .status(400)
            .json({
              error: `Price not found for product_id ${item.product_id}`,
            });
        }
        totalValue += price * item.quantity_sent;
      }

      // Determinar fechas
      const startDate = new Date().toISOString().split("T")[0]; // Fecha actual
      const defaultEndDate = new Date();
      defaultEndDate.setDate(defaultEndDate.getDate() + 30); // 30 días después
      const endDate = end_date || defaultEndDate.toISOString().split("T")[0];

      // Insertar la consignación
      const consignmentResult = await pool.query(
        `INSERT INTO consignments (supplier_id, user_id, start_date, end_date, total_value, sold_value, status, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *`,
        [supplierId, userId, startDate, endDate, totalValue, 0.0, "active"]
      );

      const consignmentId = consignmentResult.rows[0].id;
      for (const item of items) {
        const price = products[item.product_id]; // Obtener el precio del producto
        await pool.query(
          "INSERT INTO consignment_items (consignment_id, product_id, quantity_sent, quantity_sold, quantity_returned, quantity_delivered, price_at_time) VALUES ($1, $2, $3, $4, $5, $6, $7)",
          [
            consignmentId,
            item.product_id,
            item.quantity_sent,
            0,
            0,
            item.quantity_sent,
            price,
          ]
        );
      }

      res
        .status(201)
        .json({
          message: "Consignment created",
          consignment: consignmentResult.rows[0],
        });
    } catch (error) {
      console.error("Error en POST /consignments:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  }
);

// Liquidar consignación
router.post(
  "/users/:userId/suppliers/:supplierId/consignments/:consignmentId/settle",
  async (req: Request, res: Response) => {
    try {
      const { userId, supplierId, consignmentId } = req.params;
      const { items } = req.body;

      const consignmentCheck = await pool.query(
        "SELECT * FROM consignments WHERE id = $1 AND supplier_id = $2 AND user_id = $3 AND status = $4",
        [consignmentId, supplierId, userId, "active"]
      );
      if (consignmentCheck.rows.length === 0) {
        return res.status(404).json({ error: "Active consignment not found" });
      }

      for (const item of items) {
        const itemCheck = await pool.query(
          "SELECT * FROM consignment_items WHERE consignment_id = $1 AND product_id = $2",
          [consignmentId, item.product_id]
        );
        if (itemCheck.rows.length === 0) {
          return res
            .status(404)
            .json({
              error: `Item ${item.product_id} not found in consignment`,
            });
        }

        const { quantity_sent } = itemCheck.rows[0];
        const quantityReturned = quantity_sent - item.quantity_sold;

        await pool.query(
          "UPDATE consignment_items SET quantity_sold = $1, quantity_returned = $2 WHERE consignment_id = $3 AND product_id = $4",
          [item.quantity_sold, quantityReturned, consignmentId, item.product_id]
        );

        await pool.query(
          "UPDATE products SET stock = stock + $1 WHERE id = $2",
          [quantityReturned, item.product_id]
        );
      }

      const soldItems = await pool.query(
        `SELECT ci.quantity_sold, p.price
       FROM consignment_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.consignment_id = $1`,
        [consignmentId]
      );

      const totalAmount = soldItems.rows.reduce(
        (sum, item) => sum + item.quantity_sold * item.price,
        0
      );
      if (totalAmount > 0) {
        await pool.query(
          "INSERT INTO supplier_debts (supplier_id, user_id, amount, created_at, updated_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
          [supplierId, userId, totalAmount]
        );
      }

      await pool.query(
        "UPDATE consignments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
        ["completed", consignmentId] // Cambiado a 'completed'
      );

      res.status(200).json({ message: "Consignment settled", totalAmount });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
);

export default router;
