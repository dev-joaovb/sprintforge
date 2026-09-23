import prisma from '../server/db/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🌱 Iniciando seed do banco de dados PostgreSQL...');

  const adminEmail = 'admin@sprintforge.com';
  const existingUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  let adminUser = existingUser;

  if (!existingUser) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    adminUser = await prisma.user.create({
      data: {
        name: 'Administrador SprintForge',
        email: adminEmail,
        passwordHash,
        techArea: 'Engenharia Fullstack',
        phone: '(11) 98888-7777',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      },
    });
    console.log(`✅ Usuário administrador criado: ${adminUser.email} (Senha: admin123)`);
  } else {
    console.log(`ℹ️ Usuário administrador já existe no banco: ${adminUser?.email}`);
  }

  // Check if initial project exists
  if (adminUser) {
    const existingProject = await prisma.project.findFirst({
      where: { adminId: adminUser.id },
    });

    if (!existingProject) {
      const project = await prisma.project.create({
        data: {
          name: 'Plataforma Core SprintForge',
          description: 'Desenvolvimento do ecossistema central de engenharia ágil com XP, TDD e PostgreSQL.',
          activeMethodology: 'XP',
          teamSize: 5,
          adminId: adminUser.id,
          adminName: adminUser.name,
          adminEmail: adminUser.email,
          tags: ['Arquitetura', 'PostgreSQL', 'Prisma', 'XP'],
          members: {
            create: [
              {
                userId: adminUser.id,
                name: adminUser.name,
                email: adminUser.email,
                role: 'ADMIN',
                techArea: adminUser.techArea,
                avatarUrl: adminUser.avatarUrl,
              },
            ],
          },
        },
      });
      console.log(`✅ Projeto inicial criado: ${project.name}`);
    }
  }

  console.log('🎉 Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
