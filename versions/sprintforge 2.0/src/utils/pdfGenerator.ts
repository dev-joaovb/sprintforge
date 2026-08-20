import { jsPDF } from 'jspdf';
import { Project, Task, ChatMessage, Sprint, TddTestCase } from '../types';

export const generateProjectPdfReport = (
  project: Project,
  tasks: Task[],
  chatMessages: ChatMessage[],
  sprints: Sprint[] = [],
  tddTests: TddTestCase[] = []
) => {
  const doc = new jsPDF();
  let y = 15;

  // Header Styling (Dark Banner)
  doc.setFillColor(15, 23, 42); // Dark slate background
  doc.rect(0, 0, 210, 36, 'F');

  // Title Text
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('SprintForge - Relatório Final de Conclusão de Projeto', 14, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(`Projeto: ${project.name} | Metodologia Aplicada: ${project.activeMethodology}`, 14, 28);

  y = 45;

  // Project Info Card
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y, 182, 38, 3, 3, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('1. Informações Básicas do Projeto', 18, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(`• Administrador Responsável: ${project.adminName || 'Administrador'} (${project.adminEmail || 'admin@sprintforge.com'})`, 18, y + 16);
  doc.text(`• Data de Criação: ${project.createdAt} | Data de Conclusão: ${project.completedAt || new Date().toLocaleDateString('pt-BR')}`, 18, y + 22);
  doc.text(`• Total de Vagas/Integrantes: ${project.members.length} / ${project.teamSize} membros ativos`, 18, y + 28);
  if (project.completionNotes) {
    doc.text(`• Nota do Conclusão: ${project.completionNotes}`, 18, y + 34);
  }

  y += 46;

  // Executive Metrics
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('2. Resumo de Métricas e Desempenho', 14, y);
  y += 6;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const totalStoryPoints = tasks.reduce((acc, t) => acc + (t.storyPoints || 0), 0);
  const completionPercent = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 100;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`• Total de Tarefas Criadas: ${totalTasks}`, 18, y);
  y += 5;
  doc.text(`• Tarefas Finalizadas (Done): ${completedTasks} (${completionPercent}% concluído)`, 18, y);
  y += 5;
  doc.text(`• Total de Story Points Entregues: ${totalStoryPoints} pts`, 18, y);
  y += 5;
  if (sprints.length > 0) {
    doc.text(`• Sprints Realizadas: ${sprints.length} ciclo(s)`, 18, y);
    y += 5;
  }
  if (tddTests.length > 0) {
    doc.text(`• Suíte TDD: ${tddTests.filter((t) => t.status === 'GREEN').length} / ${tddTests.length} testes em verde`, 18, y);
    y += 5;
  }

  y += 6;

  // Team Members
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('3. Participantes e Papéis da Equipe', 14, y);
  y += 6;

  if (project.members && project.members.length > 0) {
    project.members.forEach((m, idx) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      const roleText = m.role === 'ADMIN' ? '[ADMINISTRADOR DO PROJETO]' : '[MEMBRO PARTICIPANTE]';
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(`${idx + 1}. ${m.name} - ${roleText}`, 18, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`    E-mail: ${m.email} | Área: ${m.techArea} | Data de Entrada: ${m.joinedAt || '2026-08-01'}`, 18, y + 4);
      y += 9;
    });
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Nenhum membro registrado além do administrador.', 18, y);
    y += 6;
  }

  y += 6;

  // Project Chat Summary
  if (y > 230) {
    doc.addPage();
    y = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('4. Histórico de Comunicação (Chat Integrado)', 14, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Total de mensagens trocadas no canal de chat: ${chatMessages.length}`, 18, y);
  y += 7;

  // Print recent messages
  const recentMessages = chatMessages.slice(-20);
  if (recentMessages.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.text('Nenhuma mensagem trocada no chat durante o ciclo deste projeto.', 18, y);
    y += 6;
  } else {
    recentMessages.forEach((msg) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      if (msg.isSystem) {
        doc.setTextColor(147, 51, 234); // Purple for system
        doc.text(`[SISTEMA] (${msg.timestamp}):`, 18, y);
      } else {
        doc.setTextColor(30, 41, 59);
        doc.text(`[${msg.timestamp}] ${msg.senderName} (${msg.senderRole || 'MEMBRO'}):`, 18, y);
      }
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);

      const lines = doc.splitTextToSize(msg.content, 170);
      doc.text(lines, 22, y + 4);
      y += 4 + lines.length * 3.8 + 2;
    });
  }

  // Footer signoff
  if (y > 260) {
    doc.addPage();
    y = 20;
  }
  y += 6;
  doc.setDrawColor(203, 213, 225);
  doc.line(14, y, 196, y);
  y += 6;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Relatório gerado automaticamente pela Plataforma SprintForge.', 14, y);
  doc.text(`Documento emitido em: ${new Date().toLocaleString('pt-BR')}`, 14, y + 4);

  // Save PDF file
  const fileName = `Relatorio_SprintForge_${project.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`;
  doc.save(fileName);
};
