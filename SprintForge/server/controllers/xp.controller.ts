import { Response } from 'express';
import prisma from '../db/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export class XpController {
  // Pair Programming
  static async getPairSessions(req: AuthenticatedRequest, res: Response) {
    try {
      const { projectId } = req.params;
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

  // TDD Test Suite
  static async getTddTests(req: AuthenticatedRequest, res: Response) {
    try {
      const { projectId } = req.params;
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
      const builds = await prisma.ciBuild.findMany({
        where: { projectId },
        orderBy: { timestamp: 'desc' },
      });
      return res.status(200).json({ success: true, data: { builds } });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
