const { Client } = require('pg');

const client = new Client({
    host: 'wstd.com.ar',
    database: 'insumos_db',
    user: 'wstd',
    password: 'Wstd.admin.1822',
    port: 5432,
});

async function checkDatabase() {
    try {
        await client.connect();
        console.log('✓ Connected to database\n');

        // Check if productos table exists
        const tableCheck = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'productos'
            );
        `);

        if (!tableCheck.rows[0].exists) {
            console.log('❌ Table "productos" does not exist. Creating it...\n');
            
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
            
            console.log('✓ Table "productos" created successfully\n');
        } else {
            console.log('✓ Table "productos" exists\n');
        }

        // Get table schema
        const schema = await client.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'productos' 
            ORDER BY ordinal_position;
        `);

        console.log('Table Schema:');
        console.table(schema.rows);

        // Get sample data
        const data = await client.query('SELECT * FROM productos LIMIT 5');
        console.log(`\nTotal products: ${data.rows.length}`);
        if (data.rows.length > 0) {
            console.log('\nSample data:');
            console.table(data.rows);
        } else {
            console.log('\n⚠ No products found in database');
        }

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
        console.log('\n✓ Connection closed');
    }
}

checkDatabase();
