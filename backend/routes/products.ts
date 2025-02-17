import { Router } from 'express';
const router = Router();
const Product = require('../models/product');

// Crear un producto
router.post('/add', async (req, res) => {
    try {
        const newProduct = await Product.create(req.body);
        res.json('Producto agregado!');
    } catch (err) {
        res.status(400).json('Error: ' + err);
    }
});

// Leer todos los productos
router.get('/', async (req, res) => {
    try {
        const products = await Product.findAll();
        res.json(products);
    } catch (err) {
        res.status(400).json('Error: ' + err);
    }
});

// Leer un producto por ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        res.json(product);
    } catch (err) {
        res.status(400).json('Error: ' + err);
    }
});

// Actualizar un producto por ID
router.post('/update/:id', async (req, res) => {
    try {
        await Product.update(req.body, { where: { id: req.params.id } });
        res.json('Producto actualizado!');
    } catch (err) {
        res.status(400).json('Error: ' + err);
    }
});

// Eliminar un producto por ID
router.delete('/:id', async (req, res) => {
    try {
        await Product.destroy({ where: { id: req.params.id } });
        res.json('Producto eliminado.');
    } catch (err) {
        res.status(400).json('Error: ' + err);
    }
});

module.exports = router;
