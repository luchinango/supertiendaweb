import express, { Request, Response } from 'express';
import pool from '../config/db'; // Asegúrate de que la ruta sea correcta

const router = express.Router();

// Interfaz para Category definida directamente aquí
interface Category {
    id?: number; // Opcional porque se genera automáticamente al crear
    name: string;
    description?: string; // Opcional porque puede ser NULL en la BD
    is_active: boolean;
}

// Crear una categoría
router.post('/', async (req: Request, res: Response) => {
    const { name, description }: Category = req.body;

    if (!name) {
        return res.status(400).json({ error: 'El nombre es obligatorio' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO categories (name, description, is_active)
             VALUES ($1, $2, TRUE) RETURNING id, name, description, is_active`,
            [name, description || null]
        );
        const newCategory: Category = result.rows[0];
        res.status(201).json({ message: 'Categoría creada exitosamente', category: newCategory });
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
});

// Listar todas las categorías (solo activas por defecto, opcional incluir inactivas)
router.get('/', async (req: Request, res: Response) => {
    const includeInactive = req.query.includeInactive === 'true'; // Parámetro opcional

    try {
        const query = includeInactive
            ? `SELECT id, name, description, is_active FROM categories ORDER BY name`
            : `SELECT id, name, description, is_active FROM categories WHERE is_active = TRUE ORDER BY name`;
        const result = await pool.query(query);
        const categories: Category[] = result.rows;
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Obtener una categoría por ID
router.get('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            `SELECT id, name, description, is_active FROM categories WHERE id = $1`,
            [id]
        );
        const category: Category = result.rows[0];
        if (!category) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }
        res.json(category);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Actualizar una categoría
router.put('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description, is_active }: Category = req.body;

    try {
        const result = await pool.query(
            `UPDATE categories
             SET name = COALESCE($1, name),
                 description = COALESCE($2, description),
                 is_active = COALESCE($3, is_active)
             WHERE id = $4
             RETURNING id, name, description, is_active`,
            [name || null, description || null, is_active ?? null, id]
        );
        const updatedCategory: Category = result.rows[0];
        if (!updatedCategory) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }
        res.json({ message: 'Categoría actualizada exitosamente', category: updatedCategory });
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
});

// Desactivar una categoría (en lugar de eliminarla)
router.delete('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            `UPDATE categories
             SET is_active = FALSE
             WHERE id = $1 AND is_active = TRUE
             RETURNING id, name, description, is_active`,
            [id]
        );
        const deactivatedCategory: Category = result.rows[0];
        if (!deactivatedCategory) {
            return res.status(404).json({ error: 'Categoría no encontrada o ya está inactiva' });
        }
        res.json({ message: 'Categoría desactivada exitosamente', category: deactivatedCategory });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

export default router;