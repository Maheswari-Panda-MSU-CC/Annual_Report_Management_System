import sql from 'mssql';

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_HOST,
  database: process.env.DB_NAME,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

export async function connectToDatabase() {
  try {
    const pool = await sql.connect(config);
    console.log('DB Connection Successful!');
    return pool;
  } catch (error) {
    console.error('DB Connection Error:', error);
    throw error;
  }
}