import { Pool } from 'pg';

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5434'),
    user: process.env.DB_USER || 'biblioteca_admin',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'biblioteca',
});

export default pool;
