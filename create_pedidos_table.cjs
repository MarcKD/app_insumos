const pg = require('pg');
const { Pool } = pg;

const insumosPool = new Pool({
    host: 'wstd.com.ar',
    database: 'insumos_db',
    user: 'wstd',
    password: 'Wstd.admin.1822',
    port: 5432,
});

const createInsumosPedidosTable = async () => {
    const client = await insumosPool.connect();
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS InsumosPedidos (
                id SERIAL PRIMARY KEY,
                producto_id INTEGER REFERENCES productos(id),
                cantidad_pedida INTEGER NOT NULL,
                usuario VARCHAR(255) NOT NULL,
                area VARCHAR(255),
                fecha_pedido TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Tabla "InsumosPedidos" creada o ya existente.');
    } catch (error) {
        console.error('Error al crear la tabla "InsumosPedidos":', error);
    } finally {
        client.release();
    }
};

createInsumosPedidosTable().then(() => {
    insumosPool.end();
});
