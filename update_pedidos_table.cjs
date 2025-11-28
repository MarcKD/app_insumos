const pg = require('pg');
const { Pool } = pg;

const insumosPool = new Pool({
    host: 'wstd.com.ar',
    database: 'insumos_db',
    user: 'wstd',
    password: 'Wstd.admin.1822',
    port: 5432,
});

const updateInsumosPedidosTable = async () => {
    const client = await insumosPool.connect();
    try {
        // Add 'status' column with a default value
        await client.query(`
            ALTER TABLE InsumosPedidos
            ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pedido';
        `);
        console.log('Columna "status" añadida o ya existente en "InsumosPedidos".');

        // Add 'fecha_recepcion' column
        await client.query(`
            ALTER TABLE InsumosPedidos
            ADD COLUMN IF NOT EXISTS fecha_recepcion TIMESTAMP WITH TIME ZONE;
        `);
        console.log('Columna "fecha_recepcion" añadida o ya existente en "InsumosPedidos".');

    } catch (error) {
        console.error('Error al actualizar la tabla "InsumosPedidos":', error);
    } finally {
        client.release();
    }
};

updateInsumosPedidosTable().then(() => {
    insumosPool.end();
});
