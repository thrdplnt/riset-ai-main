import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!, {
  ssl: false, // Vercel nanti ganti true
});

export default sql;