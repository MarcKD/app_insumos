const pg = require('pg');
const { Pool } = pg;

const insumosPool = new Pool({
    host: 'wstd.com.ar',
    database: 'insumos_db',
    user: 'wstd',
    password: 'Wstd.admin.1822',
    port: 5432,
});

async function listUsersWithAreas() {
    try {
        console.log("--- Usuarios con Áreas Asignadas ---");
        
        // Unir las tablas usuario_areas y areas para obtener el nombre del área
        const query = `
            SELECT 
                ua.username,
                a.nombre AS area_name
            FROM 
                usuario_areas ua
            JOIN 
                areas a ON ua.area_id = a.id
            ORDER BY
                ua.username;
        `;
        
        const res = await insumosPool.query(query);
        
        if (res.rows.length === 0) {
            console.log("No hay usuarios con áreas asignadas.");
        } else {
            res.rows.forEach(row => {
                console.log(`- Usuario: ${row.username}, Área: ${row.area_name}`);
            });
        }

    } catch (e) {
        console.error("Error al listar usuarios con áreas:", e);
    } finally {
        insumosPool.end();
    }
}

listUsersWithAreas();
