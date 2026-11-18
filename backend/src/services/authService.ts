import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {promisify} from 'util';
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma';
import {UnauthorizedError} from '../errors';
import {UserStatus} from '../../generated';
import {TokenPayload, AuthResponse, JwtTokenType} from '../types/authTypes';
import {PLATFORM_ADMIN_ROLE, isPlatformRole} from '../helpers/platformAuth';

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

const SALT_ROUNDS = 12;
/** Access: corto. Refresh: largo. Sin persistencia server-side en P1-D. */
const ACCESS_TOKEN_EXPIRES_IN =
  process.env.JWT_ACCESS_EXPIRES_IN || process.env.JWT_EXPIRES_IN || '1h';
const REFRESH_TOKEN_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

/** Usuario listo para firmar JWT (tenant con businessId o plataforma con null). */
type AuthTokenUser = {
  id: number;
  username: string;
  role: {code: string};
  businessId: number | null;
};

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

    const scopedUser = this.toAuthTokenUser(user);
    const token = this.generateToken(scopedUser);
    const refreshToken = this.generateRefreshToken(scopedUser);

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

  /**
   * Construye el sujeto del JWT desde BD.
   * PLATFORM_ADMIN: sin Employee y businessId null.
   * ADMIN/EMPLOYEE: exigen employee.businessId.
   */
  private toAuthTokenUser(user: {
    id: number;
    username: string;
    role: {code: string};
    employee?: {businessId: number | null} | null;
  }): AuthTokenUser {
    if (isPlatformRole(user.role.code)) {
      if (user.employee?.businessId != null) {
        throw new UnauthorizedError('Usuario de plataforma no debe tener empresa asignada');
      }
      return {
        id: user.id,
        username: user.username,
        role: {code: PLATFORM_ADMIN_ROLE},
        businessId: null,
      };
    }

    if (user.employee?.businessId == null) {
      throw new UnauthorizedError('Usuario sin empresa asignada');
    }
    return {
      id: user.id,
      username: user.username,
      role: {code: user.role.code},
      businessId: user.employee.businessId,
    };
  }

  private generateToken(user: AuthTokenUser): string {
    if (!this.privateKey) {
      throw new Error('Llave privada no inicializada');
    }

    const payload: TokenPayload = {
      userId: user.id,
      username: user.username,
      role: user.role.code,
      businessId: user.businessId,
      tokenType: 'access',
    };

    return jwt.sign(payload, this.privateKey, {
      algorithm: 'RS256',
      expiresIn: ACCESS_TOKEN_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });
  }

  private generateRefreshToken(user: AuthTokenUser): string {
    if (!this.privateKey) {
      throw new Error('Llave privada no inicializada');
    }

    const payload: TokenPayload = {
      userId: user.id,
      username: user.username,
      role: user.role.code,
      businessId: user.businessId,
      tokenType: 'refresh',
    };

    return jwt.sign(payload, this.privateKey, {
      algorithm: 'RS256',
      expiresIn: REFRESH_TOKEN_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });
  }

  /**
   * Verifica firma RS256 y rehidrata role/businessId desde BD.
   * @param expectedType Por defecto `access` (middleware). Usar `refresh` en renovación.
   */
  async verifyToken(token: string, expectedType: JwtTokenType = 'access'): Promise<TokenPayload> {
    if (!this.publicKey) {
      console.error('Error: Llave pública no inicializada');
      throw new Error('Llave pública no inicializada');
    }

    try {
      const decoded = jwt.verify(token, this.publicKey, {algorithms: ['RS256']}) as TokenPayload;

      if (decoded.tokenType !== expectedType) {
        throw new UnauthorizedError(
          expectedType === 'refresh'
            ? 'Se requiere un refresh token válido'
            : 'Se requiere un access token válido'
        );
      }

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

      // Rol efectivo solo desde BD (claims de cliente no escalan privilegios)
      const roleCode = user.role.code;
      if (isPlatformRole(roleCode)) {
        if (user.employee?.businessId != null) {
          throw new UnauthorizedError('Usuario de plataforma no debe tener empresa asignada');
        }
        return {
          userId: decoded.userId,
          username: decoded.username,
          role: PLATFORM_ADMIN_ROLE,
          businessId: null,
          tokenType: expectedType,
          iat: decoded.iat,
          exp: decoded.exp,
        };
      }

      const businessId = user.employee?.businessId;
      if (businessId == null) {
        throw new UnauthorizedError('Usuario sin empresa asignada');
      }

      return {
        userId: decoded.userId,
        username: decoded.username,
        role: roleCode,
        businessId,
        tokenType: expectedType,
        iat: decoded.iat,
        exp: decoded.exp,
      };
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      console.error('Error verificando token:', error instanceof Error ? error.message : 'unknown');
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Token expirado');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError(`Token inválido: ${error.message}`);
      }
      throw error;
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    try {
      const decoded = await this.verifyToken(refreshToken, 'refresh');

      const user = await prisma.user.findUnique({
        where: {id: decoded.userId},
        select: {
          id: true,
          username: true,
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

      if (!user || user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedError('Usuario no encontrado o inactivo');
      }

      const scopedUser = this.toAuthTokenUser(user);

      return {
        token: this.generateToken(scopedUser),
        refreshToken: this.generateRefreshToken(scopedUser),
      };
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
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

  /**
   * Obtener datos completos del usuario desde el token
   */
  async getUserFromToken(token: string): Promise<any> {
    const decoded = await this.verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        phone: true,
        status: true,
        roleId: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true,
        role: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            position: true,
            department: true,
            startDate: true,
            endDate: true,
            salary: true,
            gender: true,
            birthDate: true,
            email: true,
            address: true,
            phone: true,
            ciNumber: true,
            emergencyContact: true,
            emergencyPhone: true,
            status: true,
            businessId: true,
            business: {
              select: {
                id: true,
                name: true,
                legalName: true,
                nit: true,
                email: true,
                phone: true,
                address: true,
                city: true,
                department: true,
                country: true,
                businessType: true,
                status: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      throw new UnauthorizedError('Usuario no encontrado');
    }

    return user;
  }
}

export const authService = new AuthService();
export default authService;
