import {Request, Response} from 'express';
import prisma from '../config/prisma';

export const getAll = async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {products: true},
        },
      },
    });

    const formattedCategories = categories.map((category) => ({
      id: category.id,
      name: category.name,
      description: category.description,
      isActive: category.isActive,
      count: category._count.products,
    }));

    res.json(formattedCategories);
  } catch (error) {
    console.error(error);
    res.status(500).json({error: 'Failed to fetch categories'});
  }
};

export const getById = async (req: Request, res: Response) => {
  const {id} = req.params;
  const category = await prisma.category.findUnique({where: {id: Number(id)}});
  if (!category) {
    res.status(404).json({message: 'No encontrado'});
    return;
  }
  res.json(category);
};

export const create = async (req: Request, res: Response) => {
  const {name, description, isActive} = req.body;

  // Verificar unicidad del nombre
  const exists = await prisma.category.findUnique({where: {name}});
  if (exists) {
    res.status(400).json({message: 'Ya existe una categoría con ese nombre'});
    return;
  }

  const category = await prisma.category.create({
    data: {
      name,
      description,
      isActive,
    },
  });

  res.status(201).json(category);
};

export const update = async (req: Request, res: Response) => {
  const {id} = req.params;
  const {name, description, isActive} = req.body;

  const category = await prisma.category.update({
    where: {id: Number(id)},
    data: {
      name,
      description,
      isActive,
    },
  });

  res.json(category);
};

export const remove = async (req: Request, res: Response) => {
  const {id} = req.params;
  await prisma.category.delete({where: {id: Number(id)}});
  res.status(204).send();
};
