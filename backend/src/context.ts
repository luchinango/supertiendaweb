import {Request, Response, NextFunction} from 'express';
import prisma from './config/prisma';

export const setContext = (req: Request, res: Response, next: NextFunction) => {
  req.context = {prisma};
  next();
};
