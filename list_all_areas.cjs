const pg = require('pg');
const { Pool } = pg;

const insumosPool = new Pool({
    host: 'wstd.com.ar',
    database: 'insumos_db',
    user: 'wstd',
    password: 'Wstd.admin.1822',
    port: 5432,
});

async function listAllAreas() {
    try {
        console.log("--- Listado de Todas las Áreas Creadas ---");
        
        const res = await insumosPool.query('SELECT id, nombre FROM areas ORDER BY nombre;');
        
        if (res.rows.length === 0) {
            console.log("No hay áreas creadas.");
        } else {
            res.rows.forEach(area => {
                console.log(`- ID: ${area.id}, Nombre: ${area.nombre}`);
            });
        }

    } catch (e) {
        console.error("Error al listar las áreas:", e);
    } finally {
        insumosPool.end();
    }
}

listAllAreas();
