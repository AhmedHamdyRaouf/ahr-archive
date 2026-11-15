import postgres from 'postgres';
const g = globalThis;
export const sql = g.__ahr_sql || (g.__ahr_sql = postgres(process.env.DATABASE_URL, {
  prepare: false, max: 3, idle_timeout: 20, connect_timeout: 15, ssl: process.env.DATABASE_SSL === 'off' ? false : 'require'
}));
