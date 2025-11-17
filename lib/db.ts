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
  },
  pool: {
    max: 20, // Increased from 10 to 20 for better concurrency
    min: 5,  // Keep minimum connections alive (was 0)
    idleTimeoutMillis: 30000,
    acquireTimeoutMillis: 30000,
    createTimeoutMillis: 30000,
  },
  requestTimeout: 30000,
  connectionTimeout: 30000,
};

// Singleton connection pool - reused across all API calls
let pool: ConnectionPool | null = null;
let isConnecting = false; // Prevent multiple simultaneous connection attempts

export async function connectToDatabase(): Promise<ConnectionPool> {
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
        return pool;
      } else {
        // Pool is explicitly disconnected, reset it
        console.warn('Pool is disconnected, recreating...');
        pool = null;
      }
    }

    // Prevent multiple simultaneous connection attempts
    if (isConnecting) {
      // Wait for existing connection attempt (max 5 seconds)
      let waitCount = 0;
      while (isConnecting && !pool && waitCount < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        waitCount++;
      }
      if (pool) return pool;
    }

    // Create new connection pool
    isConnecting = true;
    try {
      pool = await sql.connect(config);
      console.log('DB Connection Pool Created!');
      return pool;
    } finally {
      isConnecting = false;
    }
  } catch (error) {
    isConnecting = false;
    console.error('DB Connection Error:', error);
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
      console.log('DB Connection Pool Closed');
    } catch (error) {
      console.error('Error closing DB connection:', error);
    }
  }
}
