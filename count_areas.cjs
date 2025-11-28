const pg = require('pg');
const { Pool } = pg;

const insumosPool = new Pool({
    host: 'wstd.com.ar',
    database: 'insumos_db',
    user: 'wstd',
    password: 'Wstd.admin.1822',
    port: 5432,
});

async function countAreas() {
    try {
        console.log("--- Contando Áreas Creadas ---");
        
        const res = await insumosPool.query('SELECT COUNT(*) FROM areas;');
        const areaCount = res.rows[0].count;
        
        console.log(`Actualmente hay ${areaCount} áreas creadas.`);

    } catch (e) {
        console.error("Error al contar las áreas:", e);
    } finally {
        insumosPool.end();
    }
}

countAreas();
