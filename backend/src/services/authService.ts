import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {promisify} from 'util';
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma';
import {UnauthorizedError} from '../errors';
import {EmployeeStatus, Gender, UserStatus} from '../../prisma/generated';

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

const SALT_ROUNDS = 12;

interface TokenPayload {
  userId: number;
  username: string;
  businessId: number;
  role: string;
  iat?: number;
  exp?: number;
}

interface AuthResponse {
  token: string;
  refreshToken: string;
  user: {
    id: number;
    username: string;
    role: string;
    employee?: {
      firstName: string;
      lastName: string | null;
      position: string;
      startDate: Date;
      status: EmployeeStatus;
      gender: Gender;
      birthDate: Date | null;
      email: string | null;
      address: string | null;
      phone: string | null;
      businessId: number;
    };
  };
}

class AuthService {
  private readonly privateKeyPath: string;
  private readonly publicKeyPath: string;
  private privateKey: string | null = null;
  private publicKey: string | null = null;

  constructor() {
    this.privateKeyPath = path.join(__dirname, '../../keys/private.pem');
    this.publicKeyPath = path.join(__dirname, '../../keys/public.pem');
    this.initializeKeys().then(r => console.log('Llaves RSA inicializadas correctamente'));
  }

  private async initializeKeys(): Promise<void> {
    try {
      console.log('Iniciando inicialización de llaves RSA...');

      if (!fs.existsSync(this.privateKeyPath) || !fs.existsSync(this.publicKeyPath)) {
        console.log('No se encontraron las llaves, generando nuevo par...');
        await this.generateKeyPair();
      }

      this.privateKey = await readFileAsync(this.privateKeyPath, 'utf8');
      this.publicKey = await readFileAsync(this.publicKeyPath, 'utf8');

      console.log('Llaves cargadas exitosamente:');
    } catch (error) {
      console.error('Error inicializando llaves RSA:', error);
      throw new Error('Error en la configuración de autenticación');
    }
  }

  private async generateKeyPair(): Promise<void> {
    try {
      console.log('Generando nuevo par de llaves RSA...');
      const keysDir = path.dirname(this.privateKeyPath);

      if (!fs.existsSync(keysDir)) {
        console.log('Creando directorio para llaves:', keysDir);
        fs.mkdirSync(keysDir, {recursive: true});
      }

      const {privateKey, publicKey} = crypto.generateKeyPairSync('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem'
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem'
        }
      });

      console.log('Llaves generadas, guardando en archivos...');

      await writeFileAsync(this.privateKeyPath, privateKey);
      await writeFileAsync(this.publicKeyPath, publicKey);

      console.log('Llaves guardadas exitosamente');

      if (!fs.existsSync(this.privateKeyPath) || !fs.existsSync(this.publicKeyPath)) {
        throw new Error('Error: Los archivos de llaves no se crearon correctamente');
      }

      this.privateKey = privateKey;
      this.publicKey = publicKey;
    } catch (error) {
      console.error('Error generando par de llaves:', error);
      throw new Error('Error generando llaves de autenticación');
    }
  }

  async login(username: string, password: string): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({
      where: {username},
      select: {
        id: true,
        username: true,
        passwordHash: true,
        role: {
          select: {
            code: true
          }
        },
        status: true,
        employee: {
          select: {
            firstName: true,
            lastName: true,
            position: true,
            startDate: true,
            status: true,
            gender: true,
            birthDate: true,
            email: true,
            address: true,
            phone: true,
            businessId: true
          }
        }
      }
    });

    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    const isValidPassword = await this.verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    const token = this.generateToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return {
      token,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        role: user.role.code,
        employee: user.employee || undefined
      }
    };
  }

  private generateToken(user: any): string {
    if (!this.privateKey) {
      throw new Error('Llave privada no inicializada');
    }

    const payload: TokenPayload = {
      userId: user.id,
      username: user.username,
      role: user.role.code,
      businessId: user.employee?.businessId
    };

    return jwt.sign(payload, this.privateKey, {
      algorithm: 'RS256',
      expiresIn: '30d' // 1h
    });
  }

  private generateRefreshToken(user: any): string {
    if (!this.privateKey) {
      throw new Error('Llave privada no inicializada');
    }

    const payload: TokenPayload = {
      userId: user.id,
      username: user.username,
      role: user.role.code,
      businessId: user.employee?.businessId
    };

    return jwt.sign(payload, this.privateKey, {
      algorithm: 'RS256',
      expiresIn: '30d' // 7d
    });
  }

  async verifyToken(token: string): Promise<TokenPayload> {
    if (!this.publicKey) {
      console.error('Error: Llave pública no inicializada');
      throw new Error('Llave pública no inicializada');
    }

    try {
      const decoded = jwt.verify(token, this.publicKey, {algorithms: ['RS256']}) as TokenPayload

      const user = await prisma.user.findUnique({
        where: {id: decoded.userId},
        select: {
          status: true,
          role: {
            select: {
              code: true
            }
          },
          employee: {
            select: {
              businessId: true
            }
          }
        }
      });

      if (!user || user.status !== 'ACTIVE') {
        throw new UnauthorizedError('Usuario no válido o inactivo');
      }

      if (decoded.role !== user.role.code) {
        throw new UnauthorizedError('El rol del usuario ha cambiado');
      }

      // decoded.businessId = decoded.businessId || user.employee?.businessId
      return decoded;
    } catch (error) {
      console.error('Error detallado verificando token:', error);
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Token expirado');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        console.error('Error específico de JWT:', error.message);
        throw new UnauthorizedError(`Token inválido: ${error.message}`);
      }
      throw error;
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<{ token: string }> {
    try {
      const decoded = await this.verifyToken(refreshToken);

      const user = await prisma.user.findUnique({
        where: {id: decoded.userId},
        select: {
          id: true,
          username: true,
          role: {
            select: {
              code: true
            }
          }
        }
      });

      if (!user) {
        throw new UnauthorizedError('Usuario no encontrado');
      }

      const newToken = this.generateToken(user);
      return {token: newToken};
    } catch (error) {
      throw new UnauthorizedError('Token de actualización inválido');
    }
  }

  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: {id: userId},
      select: {passwordHash: true}
    });

    if (!user) {
      throw new UnauthorizedError('Usuario no encontrado');
    }

    const isValidPassword = await this.verifyPassword(currentPassword, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedError('Contraseña actual incorrecta');
    }

    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: {id: userId},
      data: {
        passwordHash: newPasswordHash,
        updatedAt: new Date()
      }
    });
  }

  async createUser(userData: {
    username: string;
    password: string;
    roleId: number;
    status?: UserStatus;
  }): Promise<void> {
    const exists = await prisma.user.findUnique({
      where: {username: userData.username}
    });

    if (exists) {
      throw new Error('El nombre de usuario ya está en uso');
    }

    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const passwordHash = await bcrypt.hash(userData.password, salt);

    await prisma.user.create({
      data: {
        username: userData.username,
        passwordHash: passwordHash,
        roleId: userData.roleId,
        status: userData.status || UserStatus.ACTIVE,
      }
    });
  }
}

export const authService = new AuthService();
export default authService;
