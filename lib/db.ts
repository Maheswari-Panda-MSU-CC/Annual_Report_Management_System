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
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

// Singleton connection pool - reused across all API calls
let pool: ConnectionPool | null = null;

export async function connectToDatabase(): Promise<ConnectionPool> {
  try {
    // Reuse existing connection pool if it exists
    // Note: mssql ConnectionPool doesn't have a 'connected' property
    // We check if pool exists and try to use it, recreating only if needed
    if (pool) {
      // Try to verify pool is still valid by checking if it has active connections
      // If pool exists, reuse it (mssql handles reconnection internally)
      try {
        // Simple check: if pool exists, try to use it
        // mssql will handle reconnection if needed
        return pool;
      } catch (err) {
        // If pool is invalid, reset it
        pool = null;
      }
    }

    // Create new connection pool (only once, then reused)
    pool = await sql.connect(config);
    console.log('DB Connection Pool Created!');
    return pool;
  } catch (error) {
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
