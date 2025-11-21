const { Client } = require('pg');

const client = new Client({
    host: 'wstd.com.ar',
    database: 'insumos_db',
    user: 'wstd',
    password: 'Wstd.admin.1822',
    port: 5432,
});

async function checkTables() {
    try {
        await client.connect();

        const prodCount = await client.query('SELECT COUNT(*) FROM productos');
        console.log(`Productos count: ${prodCount.rows[0].count}`);

        const movCount = await client.query('SELECT COUNT(*) FROM movimientos_stock');
        console.log(`Movimientos count: ${movCount.rows[0].count}`);

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

checkTables();
