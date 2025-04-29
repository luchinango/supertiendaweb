import {Request, Response} from "express";
import prisma from "../config/prisma";
import {generateToken} from "../config/auth";
import {UnauthorizedError} from "../errors";

export const login = async (req: Request, res: Response) => {
  const {username, password} = req.body;

  const user = await prisma.user.findUnique({
    where: {username},
    select: {
      id: true,
      password_hash: true,
      role: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!user || !(await comparePassword(password, user.password_hash))) {
    throw new UnauthorizedError("Invalid credentials");
  }

  const token = generateToken(user.id);

  res.json({token});
};

export const getCurrentUser = async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: {id: req.user!.id},
    select: {
      id: true,
      username: true,
      role: true,
    },
  });

  res.json(user);
};

async function comparePassword(
  password: string,
  password_hash: string
): Promise<boolean> {
  return password === password_hash;
}


export const getAll = async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        role: true,
        employee: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({message: 'Failed to fetch users'});
  }
};