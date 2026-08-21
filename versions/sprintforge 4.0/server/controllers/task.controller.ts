import { Response } from 'express';
import { z } from 'zod';
import prisma from '../db/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export const taskSchema = z.object({
  projectId: z.string(),
  title: z.string().min(1, 'O título da tarefa é obrigatório'),
  description: z.string().optional(),
  status: z.string().default('todo'),
  priority: z.string().default('Média'),
  storyPoints: z.number().default(2),
  sprintId: z.string().optional().nullable(),
  assignees: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  inBacklog: z.boolean().default(false),
});

export class TaskController {
  static async listByProject(req: AuthenticatedRequest, res: Response) {
    try {
      const { projectId } = req.params;
      const tasks = await prisma.task.findMany({
        where: { projectId },
        orderBy: { createdAt: 'desc' },
      });

      return res.status(200).json({
        success: true,
        data: { tasks },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async createTask(req: AuthenticatedRequest, res: Response) {
    try {
      const data = taskSchema.parse(req.body);
      const task = await prisma.task.create({
        data: {
          projectId: data.projectId,
          title: data.title.trim(),
          description: data.description?.trim() || '',
          status: data.status,
          priority: data.priority,
          storyPoints: data.storyPoints,
          sprintId: data.sprintId || null,
          assignees: data.assignees,
          tags: data.tags,
          inBacklog: data.inBacklog,
        },
      });

      return res.status(201).json({
        success: true,
        message: 'Tarefa criada com sucesso!',
        data: { task },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async updateTask(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;

      const updated = await prisma.task.update({
        where: { id },
        data: {
          title: data.title ? data.title.trim() : undefined,
          description: data.description !== undefined ? data.description : undefined,
          status: data.status || undefined,
          priority: data.priority || undefined,
          storyPoints: data.storyPoints !== undefined ? Number(data.storyPoints) : undefined,
          sprintId: data.sprintId !== undefined ? data.sprintId : undefined,
          assignees: data.assignees || undefined,
          tags: data.tags || undefined,
          inBacklog: data.inBacklog !== undefined ? Boolean(data.inBacklog) : undefined,
        },
      });

      return res.status(200).json({
        success: true,
        message: 'Tarefa atualizada com sucesso.',
        data: { task: updated },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async deleteTask(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      await prisma.task.delete({ where: { id } });

      return res.status(200).json({
        success: true,
        message: 'Tarefa removida com sucesso.',
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
