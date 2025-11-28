const pg = require('pg');
const { Pool } = pg;

const usuariosPool = new Pool({
    host: 'wstd.com.ar',
    database: 'usuarios',
    user: 'wstd',
    password: 'Wstd.admin.1822',
    port: 5432,
});

const insumosPool = new Pool({
    host: 'wstd.com.ar',
    database: 'insumos_db',
    user: 'wstd',
    password: 'Wstd.admin.1822',
    port: 5432,
});

async function check() {
    try {
        console.log("--- USUARIOS DB ---");
        const res1 = await usuariosPool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log("Tables:", res1.rows.map(r => r.table_name).join(', '));
        
        // Check app_user_roles structure
        const res2 = await usuariosPool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'app_user_roles'
        `);
        console.log("app_user_roles columns:", res2.rows.map(r => r.column_name).join(', '));

        console.log("\n--- INSUMOS DB ---");
        const res3 = await insumosPool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log("Tables:", res3.rows.map(r => r.table_name).join(', '));

        // Check areas table
        const res4 = await insumosPool.query('SELECT * FROM areas LIMIT 5');
        console.log("Areas sample:", res4.rows);

    } catch (e) {
        console.error(e);
    } finally {
        usuariosPool.end();
        insumosPool.end();
    }
}

check();
