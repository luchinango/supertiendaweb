import { Request, Response } from 'express';
import { ProductService } from '../services/productService';

export class ProductController {
    private productService: ProductService;

    constructor() {
        this.productService = new ProductService();
        // Vincula manualmente los métodos
        this.createProduct = this.createProduct.bind(this);
        this.getAllProducts = this.getAllProducts.bind(this);
        this.getProductById = this.getProductById.bind(this);
        this.updateProduct = this.updateProduct.bind(this);
        this.deleteProduct = this.deleteProduct.bind(this);
    }

    async createProduct(req: Request, res: Response) {
        try {
            const product = await this.productService.createProduct(req.body);
            res.status(201).json(product);
        } catch (error) {
            res.status(400).json({ error: (error as Error).message });
        }
    }

    async getAllProducts(req: Request, res: Response) {
        try {
            const products = await this.productService.getAllProducts();
            res.json(products);
        } catch (error) {
            console.error('Error en getAllProducts:', error);
            res.status(500).json({ 
                error: 'Error al obtener los productos',
                details: (error as Error).message 
            });
        }
    }

    async getProductById(req: Request, res: Response) {
        try {
            const id = req.params.id;

            console.log('ID:', id);
            
            if (!id) {
                return res.status(400).json({ 
                    error: 'Se requiere un ID de producto' 
                });
            }

            const product = await this.productService.getProductById(id);
            
            if (!product) {
                return res.status(404).json({ 
                    error: `No se encontró el producto con ID: ${id}` 
                });
            }

            return res.status(200).json(product);
        } catch (error) {
            console.error('Error en getProductById:', error);
            return res.status(500).json({ 
                error: 'Error al obtener el producto desde el controlador',
                details: (error as Error).message 
            });
        }
    }

    async updateProduct(req: Request, res: Response) {
        try {
            const updatedProduct = await this.productService.updateProduct(req.params.id, req.body);
            res.json(updatedProduct);
        } catch (error) {
            res.status(400).json({ error: (error as Error).message });
        }
    }

    async deleteProduct(req: Request, res: Response) {
        try {
            await this.productService.deleteProduct(req.params.id);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: 'Error deleting product' });
        }
    }
}