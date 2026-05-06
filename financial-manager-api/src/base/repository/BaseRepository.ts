import { PrismaClient } from '@prisma/client';
import { prisma } from '@/shared/database/PrismaClient';

export abstract class BaseRepository {
  protected prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }
}
