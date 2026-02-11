import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
});

async function executeQuery(query: string, values: any[] = []) {
  if (!pool) {
    throw new Error("DB가 연결되지 않았습니다.");
  }
  return pool.query(query, values);
}

export default executeQuery;
