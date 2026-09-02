import { Response } from 'express';
import prisma from '../db/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export class ChatController {
  static async getMessagesByProject(req: AuthenticatedRequest, res: Response) {
    try {
      const { projectId } = req.params;
      const messages = await prisma.chatMessage.findMany({
        where: { projectId },
        orderBy: { createdAt: 'asc' },
      });
      return res.status(200).json({ success: true, data: { messages } });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async sendMessage(req: AuthenticatedRequest, res: Response) {
    try {
      const { projectId } = req.params;
      const { content } = req.body;
      const user = req.user;
      if (!user) return res.status(401).json({ success: false, message: 'Não autenticado.' });

      if (!content || !content.trim()) {
        return res.status(400).json({ success: false, message: 'Conteúdo da mensagem não pode ser vazio.' });
      }

      const message = await prisma.chatMessage.create({
        data: {
          projectId,
          senderId: user.id,
          senderName: user.name,
          senderTechArea: user.techArea || 'Engenharia',
          content: content.trim(),
          isSystem: false,
        },
      });

      return res.status(201).json({ success: true, data: { message } });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
