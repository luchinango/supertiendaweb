import {Router} from 'express';
import employeeRouter from '../controllers/employeeController';

const router = Router();
router.use('/employees', employeeRouter);
export default router;
