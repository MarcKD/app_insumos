const pg = require('pg');
const { Pool } = pg;

const insumosPool = new Pool({
    host: 'wstd.com.ar',
    database: 'insumos_db',
    user: 'wstd',
    password: 'Wstd.admin.1822',
    port: 5432,
});

const investigateHistory = async () => {
    let client;
    try {
        client = await insumosPool.connect();
        const res = await client.query(`
            SELECT DISTINCT area FROM historial WHERE usuario = 'lucas@wstandard.com.ar'
        `);
        
        console.log('--- Historial de Áreas para lucas@wstandard.com.ar ---');
        res.rows.forEach(row => {
            console.log(`- Área: ${row.area}`);
        });

    } catch (err) {
        console.error('Error al investigar el historial:', err);
    } finally {
        if (client) {
            client.release();
        }
        insumosPool.end();
    }
};

investigateHistory();
