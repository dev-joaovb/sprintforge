import fs from 'fs';
import path from 'path';
import { Pool, PoolClient } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { PGlite } from '@electric-sql/pglite';
import dotenv from 'dotenv';

dotenv.config();

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5432/sprintforge?schema=public';

// Embedded PGlite PostgreSQL instance as the persistent local engine
let pgliteInstance: PGlite | null = null;
let pgliteInitPromise: Promise<PGlite> | null = null;

async function getPGlite(): Promise<PGlite> {
  if (pgliteInstance) return pgliteInstance;
  if (!pgliteInitPromise) {
    pgliteInitPromise = (async () => {
      const dataDir = path.resolve(process.cwd(), 'data', 'postgres');
      if (!fs.existsSync(dataDir)) {
        try {
          fs.mkdirSync(dataDir, { recursive: true });
        } catch {}
      }

      const db = new PGlite(dataDir);
      const schemaPath = path.resolve(process.cwd(), 'prisma', 'schema.sql');
      if (fs.existsSync(schemaPath)) {
        try {
          const sql = fs.readFileSync(schemaPath, 'utf8');
          await db.exec(sql);
          console.log('[PostgreSQL Engine] Schema local verificado com sucesso.');
        } catch (err: any) {
          // Schema already exists or table exists - non-fatal
        }
      }
      pgliteInstance = db;
      return db;
    })();
  }
  return pgliteInitPromise;
}

// Pre-initialize PGlite in background
getPGlite().catch((err) => {
  console.warn('[PostgreSQL Engine Init Warning]:', err.message);
});

// Create client wrapper around PGlite
function createPGliteClient(db: PGlite): PoolClient {
  const client: any = {
    query: async (config: any, values?: any) => {
      const text = typeof config === 'string' ? config : config.text;
      const vals = typeof config === 'string' ? values : (config.values || values);
      const isArrayMode = config && typeof config === 'object' && config.rowMode === 'array';
      
      const res = await db.query(text, vals, {
        rowMode: isArrayMode ? 'array' : 'object',
      });

      return {
        rows: res.rows,
        fields: res.fields || [],
        rowCount: res.affectedRows,
      };
    },
    release: () => {},
    on: () => client,
    removeListener: () => client,
  };
  return client as PoolClient;
}

// External PostgreSQL connection pool (pgAdmin / local / remote PostgreSQL)
export const externalPool = new Pool({
  connectionString,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 3000,
});

let isExternalConnected = false;
let lastCheckTime = 0;
const CHECK_COOLDOWN_MS = 5000;

async function checkExternalPostgres(): Promise<boolean> {
  const now = Date.now();
  if (isExternalConnected) return true;

  // Avoid spamming failed connection attempts in tight loops
  if (now - lastCheckTime < CHECK_COOLDOWN_MS) {
    return false;
  }
  lastCheckTime = now;

  try {
    const client = await externalPool.connect();
    await client.query('SELECT 1');
    client.release();

    if (!isExternalConnected) {
      const sanitizedUrl = connectionString.replace(/:[^:@]+@/, ':****@');
      console.log(`[PostgreSQL] Conectado com sucesso ao PostgreSQL externo em: ${sanitizedUrl}`);
      isExternalConnected = true;

      // Verify if tables exist in external PostgreSQL database
      const checkTables = await externalPool.query(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users';"
      );
      if (checkTables.rows.length === 0) {
        console.log('[PostgreSQL] Inicializando tabelas do schema relacional no banco...');
        const schemaPath = path.resolve(process.cwd(), 'prisma', 'schema.sql');
        if (fs.existsSync(schemaPath)) {
          const sql = fs.readFileSync(schemaPath, 'utf8');
          await externalPool.query(sql);
          console.log('[PostgreSQL] Tabelas criadas com sucesso no PostgreSQL externo.');
        }
      }
    }
    return true;
  } catch (err: any) {
    if (isExternalConnected) {
      console.warn('[PostgreSQL Engine] Conexão com PostgreSQL externo interrompida. Usando motor local de contingência.');
    }
    isExternalConnected = false;
    return false;
  }
}

// Probe connection on launch
checkExternalPostgres().catch(() => {});

// Hybrid Pool that inherits from pg.Pool for PrismaPgAdapter compatibility
const hybridPool = Object.create(Pool.prototype);

Object.assign(hybridPool, {
  query: async (config: any, values?: any) => {
    const hasExternal = await checkExternalPostgres();
    if (hasExternal) {
      try {
        return await externalPool.query(config, values);
      } catch (err: any) {
        if (err.code === 'ECONNREFUSED' || err.code === '57P01') {
          isExternalConnected = false;
        }
        throw err;
      }
    }
    const db = await getPGlite();
    const client = createPGliteClient(db);
    return client.query(config, values);
  },
  connect: async () => {
    const hasExternal = await checkExternalPostgres();
    if (hasExternal) {
      try {
        return await externalPool.connect();
      } catch (err: any) {
        if (err.code === 'ECONNREFUSED' || err.code === '57P01') {
          isExternalConnected = false;
        }
        throw err;
      }
    }
    const db = await getPGlite();
    return createPGliteClient(db);
  },
  on: (event: any, listener: any) => {
    (externalPool as any).on(event, listener);
    return hybridPool;
  },
  removeListener: (event: any, listener: any) => {
    (externalPool as any).removeListener(event, listener);
    return hybridPool;
  },
  end: async () => {
    try {
      await externalPool.end();
    } catch {}
    if (pgliteInstance) {
      try {
        await pgliteInstance.close();
      } catch {}
    }
  },
});

const adapter = new PrismaPg(hybridPool);

export const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

export default prisma;
