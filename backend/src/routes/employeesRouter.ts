import { Router, Request, Response } from "express";
import express from "express";
import pool from "../config/db";
import bcrypt from "bcrypt";
import { authenticate, authorize, generateToken } from "../middleware/auth"; // Importamos desde auth.ts

const router: Router = express.Router();

interface Employee {
  firstname: string;
  lastname: string;
  position: string;
  salary: Number;
  start_date: Date;
}

// CREATE - Registrar un usuario
router.post('/register', async (req: Request, res: Response) => {
  try {
    console.log('Solicitud recibida:', req.body); // Log del cuerpo recibido

    const {
      firstName,
      lastName,
      position,
      salary,
      startDate
    } = req.body;

    console.log('Datos extraídos:', { firstName, lastName, position, salary, startDate }); // Log de datos procesados

    const query = `
      INSERT INTO employees (firstname, lastname, position, salary, start_date, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`;
    const values = [
      firstName,
      lastName,
      position,
      salary,
      startDate,
      "active"
    ];

    console.log('Ejecutando consulta con valores:', values); // Log antes de la consulta
    const result = await pool.query(query, values);

    console.log('Empleado registrado:', result.rows[0]); // Log del resultado
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error en /register:', (error as Error).message, (error as Error).stack); // Log detallado del error
    res.status(500).json({ error: (error as Error).message });
  }
});
 
// READ - Obtener todos los usuarios
router.get("/", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT e.* FROM employees e`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
