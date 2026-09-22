import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/sprintforge?schema=public';

// Cria a pool de conexões com o PostgreSQL nativo
const pool = new pg.Pool({ connectionString });

// Encapsula o pool de conexões no adaptador oficial do Prisma 7
const adapter = new PrismaPg(pool);

// Instancia o PrismaClient injetando o adaptador
export const prisma = new PrismaClient({ adapter });

export default prisma;