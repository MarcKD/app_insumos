const pg = require('pg');
const { Pool } = pg;

// Use command line arguments: node assign_user_area.cjs <username> <area_name_or_id>
const args = process.argv.slice(2);

if (args.length < 2) {
    console.log("Usage: node assign_user_area.cjs <username> <area_name_or_id>");
    process.exit(1);
}

const username = args[0];
const areaInput = args[1];

const insumosPool = new Pool({
    host: 'wstd.com.ar',
    database: 'insumos_db',
    user: 'wstd',
    password: 'Wstd.admin.1822',
    port: 5432,
});

async function assignArea() {
    try {
        // 1. Resolve Area ID
        let areaId;
        if (!isNaN(areaInput)) {
            areaId = parseInt(areaInput);
            // Verify it exists
            const res = await insumosPool.query('SELECT id, nombre FROM areas WHERE id = $1', [areaId]);
            if (res.rows.length === 0) {
                console.error(`Area ID ${areaId} not found.`);
                process.exit(1);
            }
            console.log(`Selected Area: ${res.rows[0].nombre}`);
        } else {
            // Search by name
            const res = await insumosPool.query('SELECT id, nombre FROM areas WHERE nombre ILIKE $1', [areaInput]);
            if (res.rows.length === 0) {
                console.error(`Area with name '${areaInput}' not found.`);
                process.exit(1);
            }
            areaId = res.rows[0].id;
            console.log(`Selected Area: ${res.rows[0].nombre}`);
        }

        // 2. Upsert into usuario_areas
        // Check if user exists
        const checkRes = await insumosPool.query('SELECT * FROM usuario_areas WHERE username = $1', [username]);
        
        if (checkRes.rows.length > 0) {
            // Update
            await insumosPool.query('UPDATE usuario_areas SET area_id = $1 WHERE username = $2', [areaId, username]);
            console.log(`Updated area for user '${username}' to ID ${areaId}.`);
        } else {
            // Insert
            await insumosPool.query('INSERT INTO usuario_areas (username, area_id) VALUES ($1, $2)', [username, areaId]);
            console.log(`Assigned area for user '${username}' to ID ${areaId}.`);
        }

    } catch (e) {
        console.error("Error:", e);
    } finally {
        insumosPool.end();
    }
}

assignArea();
