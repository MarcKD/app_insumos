const pg = require('pg');
const { Pool } = pg;

const usuariosPool = new Pool({
    host: 'wstd.com.ar',
    database: 'usuarios',
    user: 'wstd',
    password: 'Wstd.admin.1822',
    port: 5432,
});

async function listUsers() {
    try {
        console.log("--- Internal Users ---");
        const res1 = await usuariosPool.query('SELECT id, name FROM internal_users');
        res1.rows.forEach(u => console.log(`- ${u.name}`));

        console.log("\n--- Odoo Users ---");
        const res2 = await usuariosPool.query('SELECT id, username FROM odoo_users');
        res2.rows.forEach(u => console.log(`- ${u.username}`));

    } catch (e) {
        console.error(e);
    } finally {
        usuariosPool.end();
    }
}

listUsers();
