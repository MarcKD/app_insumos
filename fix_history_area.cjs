const pg = require('pg');
const { Pool } = pg;

const insumosPool = new Pool({
    host: 'wstd.com.ar',
    database: 'insumos_db',
    user: 'wstd',
    password: 'Wstd.admin.1822',
    port: 5432,
});

const fixHistoryArea = async () => {
    let client;
    try {
        client = await insumosPool.connect();
        await client.query('BEGIN');

        const res = await client.query(`
            UPDATE historial SET area = 'Sistemas' WHERE usuario = 'lucas@wstandard.com.ar' AND area != 'Sistemas'
        `);

        await client.query('COMMIT');
        
        console.log(`--- Corrección de Historial para lucas@wstandard.com.ar ---`);
        console.log(`${res.rowCount} registros han sido actualizados en el historial.`);

    } catch (err) {
        if (client) {
            await client.query('ROLLBACK');
        }
        console.error('Error al corregir el historial:', err);
    } finally {
        if (client) {
            client.release();
        }
        insumosPool.end();
    }
};

fixHistoryArea();
