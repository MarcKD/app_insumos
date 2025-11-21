const { Client } = require('pg');

const client = new Client({
    host: 'wstd.com.ar',
    database: 'insumos_db',
    user: 'wstd',
    password: 'Wstd.admin.1822',
    port: 5432,
});

async function createHistorialTable() {
    try {
        await client.connect();
        console.log('✓ Connected to database');

        console.log('Creating historial table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS historial (
                id SERIAL PRIMARY KEY,
                producto_id INTEGER REFERENCES productos(id) ON DELETE SET NULL,
                usuario VARCHAR(255),
                cantidad_anterior INTEGER,
                cantidad_nueva INTEGER,
                fecha TIMESTAMP WITH TIME ZONE DEFAULT now(),
                area VARCHAR(100)
            );
        `);
        console.log('✓ Table "historial" created successfully');

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

createHistorialTable();
