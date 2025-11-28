const pg = require('pg');
const { Pool } = pg;

const insumosPool = new Pool({
    host: 'wstd.com.ar',
    database: 'insumos_db',
    user: 'wstd',
    password: 'Wstd.admin.1822',
    port: 5432,
});

async function setup() {
    try {
        console.log("Creating usuario_areas table...");
        await insumosPool.query(`
            CREATE TABLE IF NOT EXISTS usuario_areas (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                area_id INTEGER REFERENCES areas(id)
            );
        `);
        console.log("Table created successfully.");

        // Optional: Pre-populate if we know some users?
        // For now, let's just leave it empty or maybe insert a test user if known?
        // I'll just create the table.
        
    } catch (e) {
        console.error("Error creating table:", e);
    } finally {
        insumosPool.end();
    }
}

setup();
