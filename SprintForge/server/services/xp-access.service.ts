import type { Prisma } from '@prisma/client';
import type { AuthPayload } from '../middleware/auth';

export interface ProjectAccessClient {
  project: {
    findFirst: (args: {
      where: Prisma.ProjectWhereInput;
      select: { id: true };
    }) => Promise<{ id: string } | null>;
  };
}

export async function checkXpProjectAccess(
  projectId: string,
  user: AuthPayload,
  db: ProjectAccessClient
): Promise<boolean> {
  const userEmail = user.email?.toLowerCase();

  const project = await db.project.findFirst({
    where: {
      id: projectId,
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

  return project !== null;
}
