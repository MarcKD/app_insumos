import pg from 'pg';
const { Pool } = pg;

// Pool de conexión para la base de datos de usuarios
const pool = new Pool({
    host: 'wstd.com.ar',
    database: 'usuarios',
    user: 'wstd',
    password: 'Wstd.admin.1822',
    port: 5432,
});

// Pool de conexión para la base de datos de insumos
const insumosPool = new Pool({
    host: 'wstd.com.ar',
    database: 'insumos_db',
    user: 'wstd',
    password: 'Wstd.admin.1822',
    port: 5432,
});

export { pool, insumosPool };
