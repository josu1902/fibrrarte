import mysql from 'mysql2/promise';

function parseUrl(url: string) {
  const u = new URL(url);
  return {
    host: u.hostname,
    port: u.port ? parseInt(u.port) : 3306,
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.replace(/^\//, ''),
  };
}

const pool = mysql.createPool({
  ...parseUrl(process.env.DATABASE_URL!),
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
});

export default pool;
