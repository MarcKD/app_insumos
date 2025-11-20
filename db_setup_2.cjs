"scrips para conectarme a la bd y crear tablas adicionales"
const { Client } = require('pg');

const dbConfig = {
    host: 'wstd.com.ar',
    database: 'insumos_db',
    user: 'wstd',
    password: 'Wstd.admin.1822',
    port: 5432,
};

const setupQuery = `
    CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nombre_usuario VARCHAR(100) UNIQUE NOT NULL,
        hash_contraseña VARCHAR(255) NOT NULL,
        rol VARCHAR(50) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS movimientos_stock (
        id SERIAL PRIMARY KEY,
        producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
        usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
        cantidad INTEGER NOT NULL,
        fecha TIMESTAMP WITH TIME ZONE DEFAULT now(),
        tipo_movimiento VARCHAR(50) NOT NULL
    );
`;

const client = new Client(dbConfig);

async function setupDatabase() {
    try {
        await client.connect();
        console.log('Conectado a la base de datos.');
        await client.query(setupQuery);
        console.log('Tablas "usuarios" y "movimientos_stock" creadas exitosamente.');
    } catch (err) {
        console.error('Error durante la creación de las tablas:', err);
    } finally {
        await client.end();
        console.log('Conexión cerrada.');
    }
}

setupDatabase();
