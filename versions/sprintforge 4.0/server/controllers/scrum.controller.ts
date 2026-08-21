import { Response } from 'express';
import prisma from '../db/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export class ScrumController {
  // Sprints
  static async getSprints(req: AuthenticatedRequest, res: Response) {
    try {
      const { projectId } = req.params;
      const sprints = await prisma.sprint.findMany({
        where: { projectId },
        include: { tasks: true },
        orderBy: { startDate: 'desc' },
      });
      return res.status(200).json({ success: true, data: { sprints } });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async createSprint(req: AuthenticatedRequest, res: Response) {
    try {
      const { projectId, name, goal, startDate, endDate } = req.body;
      const sprint = await prisma.sprint.create({
        data: {
          projectId,
          name: name.trim(),
          goal: goal?.trim() || '',
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          status: 'PLANNED',
        },
      });
      return res.status(201).json({ success: true, data: { sprint } });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // Daily Notes
  static async getDailyNotes(req: AuthenticatedRequest, res: Response) {
    try {
      const { projectId } = req.params;
      const notes = await prisma.dailyNote.findMany({
        where: { projectId },
        include: { author: { select: { id: true, name: true, techArea: true } } },
        orderBy: { date: 'desc' },
      });
      return res.status(200).json({ success: true, data: { notes } });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async createDailyNote(req: AuthenticatedRequest, res: Response) {
    try {
      const { projectId, yesterday, today, blockers } = req.body;
      const user = req.user;
      if (!user) return res.status(401).json({ success: false, message: 'Não autenticado.' });

      const note = await prisma.dailyNote.create({
        data: {
          projectId,
          authorId: user.id,
          yesterday: yesterday.trim(),
          today: today.trim(),
          blockers: blockers?.trim() || null,
        },
      });
      return res.status(201).json({ success: true, data: { note } });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // Planning Poker
  static async getPlanningPoker(req: AuthenticatedRequest, res: Response) {
    try {
      const { projectId } = req.params;
      const session = await prisma.planningPokerSession.findFirst({
        where: { projectId, active: true },
      });
      return res.status(200).json({ success: true, data: { session } });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // Retrospective Cards
  static async getRetroCards(req: AuthenticatedRequest, res: Response) {
    try {
      const { projectId } = req.params;
      const cards = await prisma.retroCard.findMany({
        where: { projectId },
        include: { author: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      });
      return res.status(200).json({ success: true, data: { cards } });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async createRetroCard(req: AuthenticatedRequest, res: Response) {
    try {
      const { projectId, sprintId, type, content } = req.body;
      const user = req.user;
      if (!user) return res.status(401).json({ success: false, message: 'Não autenticado.' });

      const card = await prisma.retroCard.create({
        data: {
          projectId,
          sprintId: sprintId || null,
          type,
          content: content.trim(),
          authorId: user.id,
        },
      });
      return res.status(201).json({ success: true, data: { card } });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
