import sql, { ConnectionPool } from 'mssql';

const config: sql.config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_HOST!,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true, // Performance optimization
  },
  pool: {
    max: 20, // Increased from 10 to 20 for better concurrency
    min: 2,  // ✅ REDUCED from 5 to 2 - faster initialization (connections created on-demand)
    idleTimeoutMillis: 30000,
    acquireTimeoutMillis: 10000, // ✅ REDUCED from 30000 - faster failure detection
    createTimeoutMillis: 10000, // ✅ REDUCED from 30000 - faster failure detection
  },
  requestTimeout: 15000, // ✅ REDUCED from 30000 - faster timeout
  connectionTimeout: 10000, // ✅ REDUCED from 30000 - faster connection timeout
};

// Singleton connection pool - reused across all API calls
let pool: ConnectionPool | null = null;
let isConnecting = false; // Prevent multiple simultaneous connection attempts

export async function connectToDatabase(): Promise<ConnectionPool> {
  const startTime = Date.now();
  try {
    // If pool exists and appears to be connected, reuse it
    if (pool) {
      // Check if pool is still valid
      // mssql ConnectionPool.connected can be true, false, or undefined
      // undefined means pool exists but connection state is unknown (usually means it's valid)
      // false means explicitly disconnected
      if (pool.connected !== false) {
        // Pool exists and is not explicitly disconnected, reuse it
        // mssql will handle reconnection internally if needed
        const elapsed = Date.now() - startTime;
        if (elapsed > 50 || process.env.NODE_ENV === 'development') {
          console.log(`[DB] Pool reused (${elapsed}ms)`);
        }
        return pool;
      } else {
        // Pool is explicitly disconnected, reset it
        console.warn('[DB] Pool is disconnected, recreating...');
        pool = null;
      }
    }

    // Prevent multiple simultaneous connection attempts
    if (isConnecting) {
      // ✅ REDUCED wait time from 5 seconds to 2 seconds
      const waitStart = Date.now();
      let waitCount = 0;
      while (isConnecting && !pool && waitCount < 20) { // 20 * 100ms = 2 seconds
        await new Promise(resolve => setTimeout(resolve, 100));
        waitCount++;
      }
      const waitTime = Date.now() - waitStart;
      if (waitTime > 100) {
        console.log(`[DB] Waited for connection: ${waitTime}ms`);
      }
      if (pool) {
        const elapsed = Date.now() - startTime;
        console.log(`[DB] Got pool after wait (${elapsed}ms total)`);
        return pool;
      }
      // If still connecting after 2 seconds, proceed with new attempt
      if (waitTime >= 2000) {
        console.warn('[DB] Connection taking too long, proceeding with new attempt');
      }
    }

    // Create new connection pool
    isConnecting = true;
    const connectStart = Date.now();
    try {
      pool = await sql.connect(config);
      const connectTime = Date.now() - connectStart;
      const totalTime = Date.now() - startTime;
      console.log(`[DB] Connection Pool Created in ${connectTime}ms (total: ${totalTime}ms)`);
      return pool;
    } finally {
      isConnecting = false;
    }
  } catch (error) {
    isConnecting = false;
    const totalTime = Date.now() - startTime;
    console.error(`[DB] Connection Error after ${totalTime}ms:`, error);
    pool = null; // Reset pool on error
    throw error;
  }
}

// Graceful shutdown function
export async function closeDatabaseConnection(): Promise<void> {
  if (pool) {
    try {
      await pool.close();
      pool = null;
      console.log('[DB] Connection Pool Closed');
    } catch (error) {
      console.error('[DB] Error closing connection:', error);
    }
  }
}

// Pre-warm connection pool on server startup (Next.js server-side only)
// This ensures the pool is ready before the first API request
if (typeof window === 'undefined') {
  // Server-side only - pre-warm connection pool asynchronously
  // Don't block server startup if connection fails
  const preWarmStart = Date.now();
  connectToDatabase()
    .then(() => {
      const preWarmTime = Date.now() - preWarmStart;
      console.log(`[DB] Connection pool pre-warmed successfully in ${preWarmTime}ms`);
    })
    .catch((error) => {
      const preWarmTime = Date.now() - preWarmStart;
      console.warn(`[DB] Pre-warming failed after ${preWarmTime}ms (will connect on first request):`, error.message);
    });
}
