import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../db/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'sprintforge_super_secure_jwt_secret_key_2026_prod';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const registerSchema = z.object({
  name: z.string().min(2, 'O nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('E-mail em formato inválido'),
  phone: z.string().optional(),
  techArea: z.string().default('Engenharia Fullstack'),
  password: z.string().min(4, 'A senha deve ter no mínimo 4 caracteres'),
});

export const loginSchema = z.object({
  email: z.string().email('E-mail em formato inválido'),
  password: z.string().min(1, 'A senha é obrigatória'),
});

export const resetPasswordSchema = z.object({
  email: z.string().email('E-mail em formato inválido'),
  newPassword: z.string().min(4, 'A nova senha deve ter no mínimo 4 caracteres'),
});

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { name, email, phone, techArea, password } = registerSchema.parse(req.body);
      const emailNormalized = email.trim().toLowerCase();

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email: emailNormalized },
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Já existe uma conta cadastrada com este e-mail.',
        });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create User
      const user = await prisma.user.create({
        data: {
          name: name.trim(),
          email: emailNormalized,
          phone: phone?.trim() || null,
          techArea,
          passwordHash,
          avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          techArea: true,
          avatarUrl: true,
          createdAt: true,
        },
      });

      // Generate JWT Token
      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name, techArea: user.techArea },
        JWT_SECRET,
        { expiresIn: (JWT_EXPIRES_IN as any) }
      );

      return res.status(201).json({
        success: true,
        message: 'Cadastro realizado com sucesso!',
        data: {
          user,
          token,
        },
      });
    } catch (err: any) {
      console.error('Error in register:', err);
      return res.status(500).json({
        success: false,
        message: err.message || 'Erro ao registrar usuário.',
      });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const emailNormalized = email.trim().toLowerCase();
      const rawEmail = email.trim();

      // 1. Search by normalized email, or fallback to case-insensitive match (crucial when data comes from pgAdmin)
      let user = await prisma.user.findUnique({
        where: { email: emailNormalized },
      });

      if (!user) {
        user = await prisma.user.findFirst({
          where: {
            email: {
              equals: rawEmail,
              mode: 'insensitive',
            },
          },
        });
      }

      if (!user) {
        console.warn(`[Auth Login]: Usuário não encontrado para o e-mail: "${rawEmail}"`);
        return res.status(401).json({
          success: false,
          message: 'E-mail ou senha incorretos.',
        });
      }

      let isPasswordValid = false;
      const cleanPassword = password.trim();
      const storedHash = (user.passwordHash || '').trim();

      // Check 1: Direct comparison (when user was inserted directly in pgAdmin/SQL with plain-text password)
      if (storedHash === cleanPassword || storedHash === password) {
        isPasswordValid = true;
        // Upgrade to secure bcrypt hash automatically in PostgreSQL
        try {
          const upgradedHash = await bcrypt.hash(password, 10);
          await prisma.user.update({
            where: { id: user.id },
            data: { passwordHash: upgradedHash },
          });
          console.log(`[Auth]: Senha em texto plano do pgAdmin convertida com sucesso para bcrypt (usuário: ${user.email})`);
        } catch (updateErr: any) {
          console.warn('[Auth]: Aviso ao migrar hash:', updateErr.message);
        }
      } else if (
        storedHash.startsWith('$2a$') ||
        storedHash.startsWith('$2b$') ||
        storedHash.startsWith('$2y$')
      ) {
        // Check 2: Standard Bcrypt hash comparison
        try {
          isPasswordValid = await bcrypt.compare(password, storedHash);
          if (!isPasswordValid && password !== cleanPassword) {
            isPasswordValid = await bcrypt.compare(cleanPassword, storedHash);
          }
        } catch (bcryptErr: any) {
          console.warn('[Auth]: Erro no bcrypt.compare:', bcryptErr.message);
        }
      } else {
        // Check 3: Fallback for SHA256 or MD5 legacy hashes
        const sha256 = crypto.createHash('sha256').update(password).digest('hex');
        const md5 = crypto.createHash('md5').update(password).digest('hex');
        if (storedHash.toLowerCase() === sha256 || storedHash.toLowerCase() === md5) {
          isPasswordValid = true;
          try {
            const upgradedHash = await bcrypt.hash(password, 10);
            await prisma.user.update({
              where: { id: user.id },
              data: { passwordHash: upgradedHash },
            });
          } catch {}
        }
      }

      if (!isPasswordValid) {
        console.warn(`[Auth Login]: Senha inválida para o usuário: "${user.email}"`);
        return res.status(401).json({
          success: false,
          message: 'E-mail ou senha incorretos.',
        });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name, techArea: user.techArea },
        JWT_SECRET,
        { expiresIn: (JWT_EXPIRES_IN as any) }
      );

      return res.status(200).json({
        success: true,
        message: 'Login realizado com sucesso!',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            techArea: user.techArea,
            avatarUrl: user.avatarUrl,
            createdAt: user.createdAt,
          },
          token,
        },
      });
    } catch (err: any) {
      console.error('Error in login:', err);
      return res.status(500).json({
        success: false,
        message: err.message || 'Erro ao realizar login.',
      });
    }
  }

  static async me(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Não autenticado.' });
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          techArea: true,
          avatarUrl: true,
          createdAt: true,
        },
      });

      if (!user) {
        return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
      }

      return res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const { email, newPassword } = resetPasswordSchema.parse(req.body);
      const emailNormalized = email.trim().toLowerCase();

      const user = await prisma.user.findUnique({
        where: { email: emailNormalized },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Nenhuma conta encontrada com este e-mail.',
        });
      }

      const passwordHash = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      });

      return res.status(200).json({
        success: true,
        message: 'Senha alterada com sucesso! Você já pode efetuar login com sua nova senha.',
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async updateProfile(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Não autenticado.' });
      }

      const { name, phone, techArea, avatarUrl } = req.body;

      const updated = await prisma.user.update({
        where: { id: req.user.id },
        data: {
          name: name ? name.trim() : undefined,
          phone: phone ? phone.trim() : undefined,
          techArea: techArea || undefined,
          avatarUrl: avatarUrl ? avatarUrl.trim() : undefined,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          techArea: true,
          avatarUrl: true,
        },
      });

      // Synchronize ProjectMember name/techArea/avatar if updated
      await prisma.projectMember.updateMany({
        where: { userId: req.user.id },
        data: {
          name: updated.name,
          techArea: updated.techArea,
          avatarUrl: updated.avatarUrl,
        },
      }).catch((e) => console.warn('[Prisma updateMany warning]:', e));

      return res.status(200).json({
        success: true,
        message: 'Perfil atualizado com sucesso.',
        data: { user: updated },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async listUsers(_req: Request, res: Response) {
    try {
      const users = await prisma.user.findMany();
      return res.status(200).json({
        success: true,
        data: { users },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async session(req: Request, res: Response) {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

      if (!token) {
        return res.status(200).json({ success: true, data: { user: null, token: null } });
      }

      let targetUserId: string | null = null;
      try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        targetUserId = decoded.id;
      } catch {
        return res.status(200).json({ success: true, data: { user: null, token: null } });
      }

      if (!targetUserId) {
        return res.status(200).json({ success: true, data: { user: null, token: null } });
      }

      const user = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          techArea: true,
          avatarUrl: true,
          createdAt: true,
        },
      });

      if (!user) {
        return res.status(200).json({ success: true, data: { user: null, token: null } });
      }

      const activeToken = jwt.sign(
        { id: user.id, email: user.email, name: user.name, techArea: user.techArea },
        JWT_SECRET,
        { expiresIn: (JWT_EXPIRES_IN as any) }
      );

      return res.status(200).json({
        success: true,
        data: {
          user,
          token: activeToken,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
