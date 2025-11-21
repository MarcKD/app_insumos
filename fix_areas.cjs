const { Client } = require('pg');

const client = new Client({
    host: 'wstd.com.ar',
    database: 'insumos_db',
    user: 'wstd',
    password: 'Wstd.admin.1822',
    port: 5432,
});

async function fixAreas() {
    try {
        await client.connect();
        console.log('✓ Connected to database');

        console.log('Updating "Sistema" to "Sistemas"...');
        const res1 = await client.query("UPDATE productos SET area = 'Sistemas' WHERE area = 'Sistema'");
        console.log(`✓ Updated ${res1.rowCount} records from "Sistema" to "Sistemas"`);

        console.log('Updating "Administracion" to "Administración"...');
        const res2 = await client.query("UPDATE productos SET area = 'Administración' WHERE area = 'Administracion'");
        console.log(`✓ Updated ${res2.rowCount} records from "Administracion" to "Administración"`);

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

fixAreas();
