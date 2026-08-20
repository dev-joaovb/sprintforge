import { Response } from 'express';
import { z } from 'zod';
import prisma from '../db/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export const createProjectSchema = z.object({
  name: z.string().min(2, 'O nome do projeto deve ter no mínimo 2 caracteres'),
  description: z.string().default(''),
  activeMethodology: z.enum(['XP', 'SCRUM', 'KANBAN']).default('XP'),
  teamSize: z.number().min(1).max(50).default(6),
  tags: z.array(z.string()).default([]),
});

export const sendInviteSchema = z.object({
  invitedEmail: z.string().email('E-mail do convidado inválido'),
});

export const removeMemberSchema = z.object({
  memberId: z.string(),
  justification: z.string().min(3, 'A justificativa é obrigatória para remover o integrante'),
});

export class ProjectController {
  static async listProjects(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const userEmail = req.user?.email.toLowerCase();

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Usuário não autenticado.' });
      }

      // Fetch projects where user is Admin OR a registered ProjectMember
      const projects = await prisma.project.findMany({
        where: {
          OR: [
            { adminId: userId },
            { adminEmail: userEmail },
            {
              members: {
                some: {
                  OR: [{ userId }, { email: userEmail }],
                },
              },
            },
          ],
        },
        include: {
          members: true,
          invites: true,
          removalLogs: true,
          tasks: true,
          sprints: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return res.status(200).json({
        success: true,
        data: { projects },
      });
    } catch (err: any) {
      console.error('Error in listProjects:', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async createProject(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ success: false, message: 'Usuário não autenticado.' });
      }

      const { name, description, activeMethodology, teamSize, tags } = createProjectSchema.parse(req.body);

      const project = await prisma.project.create({
        data: {
          name: name.trim(),
          description: description.trim(),
          activeMethodology,
          teamSize,
          status: 'ACTIVE',
          adminId: user.id,
          adminName: user.name,
          adminEmail: user.email.toLowerCase(),
          tags,
          members: {
            create: {
              userId: user.id,
              name: user.name,
              email: user.email.toLowerCase(),
              role: 'ADMIN',
              techArea: user.techArea || 'Engenharia Fullstack',
              avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            },
          },
        },
        include: {
          members: true,
          invites: true,
          tasks: true,
          sprints: true,
        },
      });

      // Add default welcome message in project chat
      await prisma.chatMessage.create({
        data: {
          projectId: project.id,
          senderId: user.id,
          senderName: 'Sistema SprintForge',
          senderRole: 'ADMIN',
          senderTechArea: 'Plataforma Ágil',
          content: `🚀 Projeto "${project.name}" criado com sucesso! Metodologia ativa: ${project.activeMethodology}.`,
          isSystem: true,
        },
      });

      return res.status(201).json({
        success: true,
        message: 'Projeto criado com sucesso!',
        data: { project },
      });
    } catch (err: any) {
      console.error('Error in createProject:', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getProjectById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const project = await prisma.project.findUnique({
        where: { id },
        include: {
          members: true,
          invites: true,
          removalLogs: true,
          tasks: true,
          sprints: true,
          pairSessions: true,
          tddTests: true,
          ciBuilds: true,
        },
      });

      if (!project) {
        return res.status(404).json({ success: false, message: 'Projeto não encontrado.' });
      }

      // Check access permission
      const isMember =
        project.adminId === userId ||
        project.members.some((m) => m.userId === userId || m.email.toLowerCase() === req.user?.email.toLowerCase());

      if (!isMember) {
        return res.status(403).json({ success: false, message: 'Acesso negado a este projeto.' });
      }

      return res.status(200).json({
        success: true,
        data: { project },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async updateStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body; // ACTIVE, INACTIVE
      const userId = req.user?.id;

      const project = await prisma.project.findUnique({ where: { id } });
      if (!project) {
        return res.status(404).json({ success: false, message: 'Projeto não encontrado.' });
      }

      if (project.adminId !== userId) {
        return res.status(403).json({ success: false, message: 'Apenas o Administrador do projeto pode alterar seu status.' });
      }

      const updated = await prisma.project.update({
        where: { id },
        data: { status },
      });

      return res.status(200).json({
        success: true,
        message: `Status do projeto alterado para ${status}.`,
        data: { project: updated },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async completeProject(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { notes } = req.body;
      const user = req.user;

      const project = await prisma.project.findUnique({ where: { id } });
      if (!project) {
        return res.status(404).json({ success: false, message: 'Projeto não encontrado.' });
      }

      if (project.adminId !== user?.id) {
        return res.status(403).json({ success: false, message: 'Apenas o Administrador do projeto pode concluí-lo.' });
      }

      const updated = await prisma.project.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          completedByUserId: user.id,
          completionNotes: notes || 'Projeto concluído com sucesso.',
        },
      });

      // System chat notice
      await prisma.chatMessage.create({
        data: {
          projectId: id,
          senderId: user.id,
          senderName: user.name,
          senderRole: 'ADMIN',
          content: `🎉 PROJETO CONCLUÍDO! O administrador ${user.name} finalizou as atividades do projeto.`,
          isSystem: true,
        },
      });

      return res.status(200).json({
        success: true,
        message: 'Projeto concluído com sucesso!',
        data: { project: updated },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async deleteProject(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const project = await prisma.project.findUnique({ where: { id } });
      if (!project) {
        return res.status(404).json({ success: false, message: 'Projeto não encontrado.' });
      }

      if (project.adminId !== userId) {
        return res.status(403).json({ success: false, message: 'Apenas o Administrador criador do projeto pode excluí-lo.' });
      }

      if (project.status === 'ACTIVE') {
        return res.status(400).json({
          success: false,
          message: 'O projeto está ATIVO. Mude o status para INATIVO antes de excluí-lo de forma segura.',
        });
      }

      await prisma.project.delete({ where: { id } });

      return res.status(200).json({
        success: true,
        message: 'Projeto excluído com sucesso.',
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async sendInvite(req: AuthenticatedRequest, res: Response) {
    try {
      const { id: projectId } = req.params;
      const { invitedEmail } = sendInviteSchema.parse(req.body);
      const user = req.user;
      if (!user) return res.status(401).json({ success: false, message: 'Não autenticado.' });

      const emailNormalized = invitedEmail.trim().toLowerCase();

      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { members: true, invites: true },
      });

      if (!project) {
        return res.status(404).json({ success: false, message: 'Projeto não encontrado.' });
      }

      // Check if already a member
      const alreadyMember = project.members.some((m) => m.email.toLowerCase() === emailNormalized);
      if (alreadyMember) {
        return res.status(400).json({ success: false, message: 'Este e-mail já faz parte do projeto.' });
      }

      // Check capacity
      const activeMembersCount = project.members.length;
      const pendingInvitesCount = project.invites.filter((i) => i.status === 'PENDING').length;
      if (activeMembersCount + pendingInvitesCount >= project.teamSize) {
        return res.status(400).json({
          success: false,
          message: `Limite de vagas do time (${project.teamSize}) atingido.`,
        });
      }

      // Check existing pending invite
      const existing = project.invites.find(
        (i) => i.invitedEmail.toLowerCase() === emailNormalized && i.status === 'PENDING'
      );
      if (existing) {
        return res.status(400).json({ success: false, message: 'Já existe um convite pendente para este e-mail.' });
      }

      const inviteCode = `SF-INV-${Math.floor(1000 + Math.random() * 9000)}`;

      const invite = await prisma.projectInvite.create({
        data: {
          projectId,
          projectName: project.name,
          projectMethodology: project.activeMethodology,
          invitedByUserId: user.id,
          invitedByUserName: user.name,
          invitedEmail: emailNormalized,
          inviteCode,
          status: 'PENDING',
        },
      });

      return res.status(201).json({
        success: true,
        message: `Convite enviado com sucesso para ${emailNormalized}!`,
        data: { invite },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async acceptInvite(req: AuthenticatedRequest, res: Response) {
    try {
      const { inviteCode } = req.body;
      const user = req.user;
      if (!user) return res.status(401).json({ success: false, message: 'Não autenticado.' });

      const invite = await prisma.projectInvite.findUnique({
        where: { inviteCode: inviteCode.trim() },
        include: { project: { include: { members: true } } },
      });

      if (!invite || invite.status !== 'PENDING') {
        return res.status(404).json({ success: false, message: 'Código de convite inválido ou expirado.' });
      }

      // Add user to project
      await prisma.$transaction([
        prisma.projectMember.create({
          data: {
            projectId: invite.projectId,
            userId: user.id,
            name: user.name,
            email: user.email.toLowerCase(),
            role: 'MEMBER',
            techArea: user.techArea || 'Desenvolvimento',
            avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          },
        }),
        prisma.projectInvite.update({
          where: { id: invite.id },
          data: { status: 'ACCEPTED' },
        }),
        prisma.chatMessage.create({
          data: {
            projectId: invite.projectId,
            senderId: user.id,
            senderName: user.name,
            senderRole: 'MEMBER',
            content: `👋 ${user.name} ingressou no projeto via convite oficial.`,
            isSystem: true,
          },
        }),
      ]);

      return res.status(200).json({
        success: true,
        message: `Você ingressou com sucesso no projeto "${invite.projectName}"!`,
        data: { projectId: invite.projectId },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async removeMember(req: AuthenticatedRequest, res: Response) {
    try {
      const { id: projectId } = req.params;
      const { memberId, justification } = removeMemberSchema.parse(req.body);
      const user = req.user;

      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { members: true },
      });

      if (!project) return res.status(404).json({ success: false, message: 'Projeto não encontrado.' });
      if (project.adminId !== user?.id) {
        return res.status(403).json({ success: false, message: 'Apenas o Administrador pode remover membros.' });
      }

      const member = project.members.find((m) => m.id === memberId || m.userId === memberId);
      if (!member) return res.status(404).json({ success: false, message: 'Membro não encontrado no projeto.' });

      if (member.role === 'ADMIN' || member.userId === project.adminId) {
        return res.status(400).json({ success: false, message: 'O Administrador do projeto não pode ser removido.' });
      }

      await prisma.$transaction([
        prisma.projectMember.delete({ where: { id: member.id } }),
        prisma.memberRemovalLog.create({
          data: {
            projectId,
            memberId: member.userId,
            memberName: member.name,
            removedByUserId: user.id,
            removedByUserName: user.name,
            justification: justification.trim(),
          },
        }),
        prisma.chatMessage.create({
          data: {
            projectId,
            senderId: user.id,
            senderName: user.name,
            senderRole: 'ADMIN',
            content: `⚠️ Integrante ${member.name} foi removido do projeto pelo Administrador. Justificativa: "${justification.trim()}"`,
            isSystem: true,
          },
        }),
      ]);

      return res.status(200).json({
        success: true,
        message: `Integrante ${member.name} foi removido do projeto com registro de justificativa.`,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async leaveProject(req: AuthenticatedRequest, res: Response) {
    try {
      const { id: projectId } = req.params;
      const user = req.user;
      if (!user) return res.status(401).json({ success: false, message: 'Não autenticado.' });

      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { members: true },
      });

      if (!project) return res.status(404).json({ success: false, message: 'Projeto não encontrado.' });

      if (project.adminId === user.id || project.adminEmail.toLowerCase() === user.email.toLowerCase()) {
        return res.status(400).json({
          success: false,
          message: 'Você é o Administrador responsável deste projeto. Você pode concluí-lo ou excluí-lo na Central de Projetos.',
        });
      }

      const member = project.members.find(
        (m) => m.userId === user.id || m.email.toLowerCase() === user.email.toLowerCase()
      );

      if (!member) {
        return res.status(400).json({ success: false, message: 'Você não faz parte deste projeto.' });
      }

      await prisma.$transaction([
        prisma.projectMember.delete({ where: { id: member.id } }),
        prisma.chatMessage.create({
          data: {
            projectId,
            senderId: user.id,
            senderName: user.name,
            senderRole: 'MEMBER',
            content: `🚪 ${user.name} saiu do projeto voluntariamente.`,
            isSystem: true,
          },
        }),
      ]);

      return res.status(200).json({
        success: true,
        message: `Você saiu do projeto "${project.name}" com sucesso.`,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async listUserInvites(req: AuthenticatedRequest, res: Response) {
    try {
      const userEmail = req.user?.email.toLowerCase();
      if (!userEmail) return res.status(401).json({ success: false, message: 'Não autenticado.' });

      const invites = await prisma.projectInvite.findMany({
        where: {
          invitedEmail: userEmail,
          status: 'PENDING',
        },
        include: {
          project: {
            select: { id: true, name: true, activeMethodology: true, teamSize: true, description: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return res.status(200).json({
        success: true,
        data: { invites },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
