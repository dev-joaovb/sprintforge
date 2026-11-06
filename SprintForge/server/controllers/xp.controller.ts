import { Response } from 'express';
import prisma from '../db/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { hasXpProjectAccess } from '../services/xp-access.prisma';
import {
  updatePairTimer,
  PairTimerError,
  type PairTimerAction,
} from '../services/xp-pair-timer.prisma';

export class XpController {
  // Pair Programming
  static async getPairSessions(req: AuthenticatedRequest, res: Response) {
    try {
      const { projectId } = req.params;

      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado.',
        });
      }

      if (!projectId?.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Identificador do projeto obrigatório.',
        });
      }

      const authorized = await hasXpProjectAccess(projectId, req.user);

      if (!authorized) {
        return res.status(403).json({
          success: false,
          message: 'Você não possui acesso às sessões deste projeto.',
        });
      }

      const sessions = await prisma.pairSession.findMany({
        where: { projectId },
        orderBy: { startedAt: 'desc' },
      });
      return res.status(200).json({ success: true, data: { sessions } });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async createPairSession(req: AuthenticatedRequest, res: Response) {
    try {
      const { projectId, driverId, driverName, navigatorId, navigatorName, taskTitle, branchName } = req.body;

      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado.',
        });
      }

      if (
        [projectId, driverId, navigatorId, taskTitle, branchName].some(
          (value) => typeof value !== 'string' || !value.trim()
        )
      ) {
        return res.status(400).json({
          success: false,
          message: 'Dados obrigatórios da sessão não informados.',
        });
      }

      if (driverId === navigatorId) {
        return res.status(400).json({
          success: false,
          message: 'Driver e Navigator devem ser usuários diferentes.',
        });
      }

      const authorized = await hasXpProjectAccess(projectId, req.user);

      if (!authorized) {
        return res.status(403).json({
          success: false,
          message: 'Você não possui acesso a este projeto.',
        });
      }

      const participants = await prisma.projectMember.findMany({
        where: {
          projectId,
          userId: { in: [driverId, navigatorId] },
        },
        select: { userId: true },
      });

      if (new Set(participants.map((member) => member.userId)).size !== 2) {
        return res.status(400).json({
          success: false,
          message: 'Driver e Navigator devem pertencer ao projeto.',
        });
      }

      const session = await prisma.pairSession.create({
        data: {
          projectId,
          driverId,
          driverName,
          navigatorId,
          navigatorName,
          taskTitle,
          branchName,
          status: 'ACTIVE',
        },
      });
      return res.status(201).json({ success: true, data: { session } });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async completePairSession(
    req: AuthenticatedRequest,
    res: Response
  ) {
    try {
      const user = req.user;

      if (!user?.id) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado.',
        });
      }

      const { id } = req.params;

      const session = await prisma.pairSession.findUnique({
        where: { id },
      });

      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Sessão de Pair Programming não encontrada.',
        });
      }

      const userEmail = user.email?.toLowerCase();

      const project = await prisma.project.findFirst({
        where: {
          id: session.projectId,
          OR: [
            { adminId: user.id },
            ...(userEmail ? [{ adminEmail: userEmail }] : []),
            {
              members: {
                some: {
                  OR: [
                    { userId: user.id },
                    ...(userEmail ? [{ email: userEmail }] : []),
                  ],
                },
              },
            },
          ],
        },
        select: { id: true },
      });

      if (!project) {
        return res.status(403).json({
          success: false,
          message: 'Você não possui permissão para concluir esta sessão.',
        });
      }

      const result = await prisma.pairSession.updateMany({
        where: {
          id,
          projectId: session.projectId,
          status: 'ACTIVE',
        },
        data: {
          status: 'COMPLETED',
        },
      });

      if (result.count === 0) {
        return res.status(409).json({
          success: false,
          message: 'Esta sessão não está ativa ou já foi concluída.',
        });
      }

      const updatedSession = await prisma.pairSession.findUnique({
        where: { id },
      });

      return res.status(200).json({
        success: true,
        data: { session: updatedSession },
      });
    } catch (err) {
      console.error('Erro ao concluir sessão XP:', err);

      return res.status(500).json({
        success: false,
        message: 'Erro interno ao concluir a sessão.',
      });
    }
  }


  static async handlePairTimer(
    req: AuthenticatedRequest,
    res: Response
  ) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado.',
        });
      }

      const { id, action } = req.params;

      const validActions: PairTimerAction[] = [
        'start',
        'pause',
        'resume',
        'reset',
        'rotate',
      ];

      if (!validActions.includes(action as PairTimerAction)) {
        return res.status(400).json({
          success: false,
          message: 'Operação de temporizador inválida.',
        });
      }

      const session = await updatePairTimer(
        id,
        req.user,
        action as PairTimerAction
      );

      return res.status(200).json({
        success: true,
        data: { session },
      });
    } catch (error) {
      if (error instanceof PairTimerError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      }

      console.error('Erro ao atualizar temporizador XP:', error);

      return res.status(500).json({
        success: false,
        message: 'Erro interno ao atualizar o temporizador.',
      });
    }
  }


  // TDD Test Suite
  static async getTddTests(req: AuthenticatedRequest, res: Response) {
    try {
      const { projectId } = req.params;

      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado.',
        });
      }

      if (!projectId?.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Identificador do projeto obrigatório.',
        });
      }

      const authorized = await hasXpProjectAccess(projectId, req.user);

      if (!authorized) {
        return res.status(403).json({
          success: false,
          message: 'Você não possui acesso aos testes deste projeto.',
        });
      }

      const tests = await prisma.tddTest.findMany({
        where: { projectId },
        orderBy: { lastRun: 'desc' },
      });
      return res.status(200).json({ success: true, data: { tests } });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async runTddTest(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;

      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado.',
        });
      }

      if (!id?.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Identificador do teste obrigatório.',
        });
      }

      const test = await prisma.tddTest.findUnique({
        where: { id },
        select: { projectId: true },
      });

      if (!test) {
        return res.status(404).json({
          success: false,
          message: 'Teste TDD não encontrado.',
        });
      }

      const authorized = await hasXpProjectAccess(test.projectId, req.user);

      if (!authorized) {
        return res.status(403).json({
          success: false,
          message: 'Você não possui permissão para executar este teste.',
        });
      }

      const status = Math.random() > 0.15 ? 'PASS' : 'FAIL';
      const updated = await prisma.tddTest.update({
        where: { id },
        data: {
          status,
          executionTimeMs: Math.floor(10 + Math.random() * 45),
          lastRun: new Date(),
        },
      });
      return res.status(200).json({ success: true, data: { test: updated } });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // CI/CD Builds
  static async getCiBuilds(req: AuthenticatedRequest, res: Response) {
    try {
      const { projectId } = req.params;

      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado.',
        });
      }

      if (!projectId?.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Identificador do projeto obrigatório.',
        });
      }

      const authorized = await hasXpProjectAccess(projectId, req.user);

      if (!authorized) {
        return res.status(403).json({
          success: false,
          message: 'Você não possui acesso aos builds deste projeto.',
        });
      }

      const builds = await prisma.ciBuild.findMany({
        where: { projectId },
        orderBy: { timestamp: 'desc' },
      });
      return res.status(200).json({ success: true, data: { builds } });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async triggerCiBuild(req: AuthenticatedRequest, res: Response) {
    try {
      const { projectId, branch } = req.body;
      const user = req.user;

      if (!user?.id) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado.',
        });
      }

      if (typeof projectId !== 'string' || !projectId.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Identificador do projeto obrigatório.',
        });
      }

      if (branch !== undefined && (typeof branch !== 'string' || !branch.trim())) {
        return res.status(400).json({
          success: false,
          message: 'Nome da branch inválido.',
        });
      }

      const authorized = await hasXpProjectAccess(projectId, user);

      if (!authorized) {
        return res.status(403).json({
          success: false,
          message: 'Você não possui permissão para disparar builds neste projeto.',
        });
      }

      const status = Math.random() > 0.2 ? 'SUCCESS' : 'FAILED';
      const buildCount = await prisma.ciBuild.count({ where: { projectId } });

      const build = await prisma.ciBuild.create({
        data: {
          projectId,
          buildNumber: buildCount + 1,
          commitHash: Math.random().toString(36).substring(2, 9),
          branch: branch?.trim() || 'main',
          triggeredBy: user?.name || 'Sistema',
          status,
          duration: '1m 12s',
        },
      });
      return res.status(201).json({ success: true, data: { build } });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
