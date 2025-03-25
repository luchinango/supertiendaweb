import express, { Router, Request, Response } from 'express';

const router: Router = express.Router();

router.get('/status', async (req: Request, res: Response) => {
  console.log('Solicitud recibida en GET /api/products-test/status');
  res.json({ message: 'Este es el endpoint de prueba en products-test' });
});

export default router;