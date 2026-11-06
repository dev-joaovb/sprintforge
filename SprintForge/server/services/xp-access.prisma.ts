import prisma from '../db/prisma';
import type { AuthPayload } from '../middleware/auth';
import { checkXpProjectAccess } from './xp-access.service';

export async function hasXpProjectAccess(
  projectId: string,
  user: AuthPayload
): Promise<boolean> {
  return checkXpProjectAccess(projectId, user, prisma);
}
