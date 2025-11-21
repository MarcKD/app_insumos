const { Client } = require('pg');

const client = new Client({
    host: 'wstd.com.ar',
    database: 'insumos_db',
    user: 'wstd',
    password: 'Wstd.admin.1822',
    port: 5432,
});

async function fixDatabase() {
    try {
        await client.connect();
        console.log('✓ Connected to database');

        // Drop tables
        console.log('Dropping tables...');
        await client.query('DROP TABLE IF EXISTS movimientos_stock CASCADE');
        await client.query('DROP TABLE IF EXISTS productos CASCADE');
        console.log('✓ Tables dropped');

        // Create productos
        console.log('Creating productos table...');
        await client.query(`
            CREATE TABLE productos (
                id SERIAL PRIMARY KEY,
                code VARCHAR(100),
                description TEXT NOT NULL,
                provider VARCHAR(255),
                stock INTEGER DEFAULT 0,
                min INTEGER DEFAULT 0,
                max INTEGER DEFAULT 0,
                area VARCHAR(100),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
            );
        `);
        console.log('✓ Table "productos" created');

        // Create movimientos_stock
        console.log('Creating movimientos_stock table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS movimientos_stock (
                id SERIAL PRIMARY KEY,
                producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
                usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
                cantidad INTEGER NOT NULL,
                fecha TIMESTAMP WITH TIME ZONE DEFAULT now(),
                tipo_movimiento VARCHAR(50) NOT NULL
            );
        `);
        console.log('✓ Table "movimientos_stock" created');

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

fixDatabase();
