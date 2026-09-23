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

  static async deleteDailyNote(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      await prisma.dailyNote.delete({ where: { id } });
      return res.status(200).json({ success: true, message: 'Nota diária excluída com sucesso.' });
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

  static async votePoker(req: AuthenticatedRequest, res: Response) {
    try {
      const { projectId, storyPoints } = req.body;
      const user = req.user;
      if (!user) return res.status(401).json({ success: false, message: 'Não autenticado.' });

      let session = await prisma.planningPokerSession.findFirst({
        where: { projectId, active: true },
      });

      if (!session) {
        session = await prisma.planningPokerSession.create({
          data: {
            projectId,
            taskTitle: 'Refinamento de Backlog',
            active: true,
            status: 'VOTING',
            votes: [],
          },
        });
      }

      const votesList: any[] = Array.isArray(session.votes) ? [...(session.votes as any[])] : [];
      const existingVoteIdx = votesList.findIndex((v) => v.memberId === user.id);
      const newVote = {
        memberId: user.id,
        memberName: user.name,
        vote: storyPoints,
        hasVoted: true,
      };

      if (existingVoteIdx >= 0) {
        votesList[existingVoteIdx] = newVote;
      } else {
        votesList.push(newVote);
      }

      const updated = await prisma.planningPokerSession.update({
        where: { id: session.id },
        data: { votes: votesList },
      });

      return res.status(200).json({ success: true, data: { session: updated } });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async revealPoker(req: AuthenticatedRequest, res: Response) {
    try {
      const { projectId } = req.body;
      const session = await prisma.planningPokerSession.findFirst({
        where: { projectId, active: true },
      });
      if (!session) return res.status(404).json({ success: false, message: 'Sessão não encontrada.' });

      const updated = await prisma.planningPokerSession.update({
        where: { id: session.id },
        data: { status: 'REVEALED' },
      });
      return res.status(200).json({ success: true, data: { session: updated } });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async resetPoker(req: AuthenticatedRequest, res: Response) {
    try {
      const { projectId } = req.body;
      const session = await prisma.planningPokerSession.findFirst({
        where: { projectId, active: true },
      });
      if (!session) return res.status(404).json({ success: false, message: 'Sessão não encontrada.' });

      const updated = await prisma.planningPokerSession.update({
        where: { id: session.id },
        data: { status: 'VOTING', votes: [] },
      });
      return res.status(200).json({ success: true, data: { session: updated } });
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

  static async deleteRetroCard(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      await prisma.retroCard.delete({ where: { id } });
      return res.status(200).json({ success: true, message: 'Cartão de retrospectiva excluído com sucesso.' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async voteRetroCard(req: AuthenticatedRequest, res: Response) {
    try {
      const { cardId } = req.body;
      const user = req.user;
      if (!user) return res.status(401).json({ success: false, message: 'Não autenticado.' });

      const card = await prisma.retroCard.findUnique({ where: { id: cardId } });
      if (!card) return res.status(404).json({ success: false, message: 'Cartão não encontrado.' });

      const updated = await prisma.retroCard.update({
        where: { id: cardId },
        data: {
          votes: { increment: 1 },
        },
      });

      return res.status(200).json({ success: true, data: { card: updated } });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async completeSprint(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const updated = await prisma.sprint.update({
        where: { id },
        data: { status: 'COMPLETED' },
      });
      return res.status(200).json({ success: true, data: { sprint: updated } });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
