const { Client } = require('pg');

const client = new Client({
    host: 'wstd.com.ar',
    database: 'insumos_db',
    user: 'wstd',
    password: 'Wstd.admin.1822',
    port: 5432,
});

async function addTipoMovimientoColumn() {
    try {
        await client.connect();
        console.log('✓ Connected to database');

        console.log('Adding "tipo_movimiento" column to "historial" table...');
        await client.query(`
            ALTER TABLE historial
            ADD COLUMN tipo_movimiento VARCHAR(50) DEFAULT 'ajuste';
        `);
        console.log('✓ Column "tipo_movimiento" added successfully');

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

addTipoMovimientoColumn();
