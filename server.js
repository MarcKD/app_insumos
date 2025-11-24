import express from 'express';
import cors from 'cors';
import pg from 'pg';
const { Pool } = pg;

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// --- Database Configuration ---
const pool = new Pool({
    host: 'wstd.com.ar',
    database: 'usuarios',
    user: 'wstd',
    password: 'Wstd.admin.1822',
    port: 5432,
});

const insumosPool = new Pool({
    host: 'wstd.com.ar',
    database: 'insumos_db',
    user: 'wstd',
    password: 'Wstd.admin.1822',
    port: 5432,
});

// --- Helper to decode Base64 ---
const decodeBase64 = (encoded) => Buffer.from(encoded, 'base64').toString('utf-8');

// --- Products API Endpoints ---
app.get('/api/productos', async (req, res) => {
    try {
        const result = await insumosPool.query('SELECT * FROM productos ORDER BY id DESC');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

app.post('/api/productos', async (req, res) => {
    const { code, description, provider, stock, min, max, area } = req.body;

    if (!description || !code || !stock) {
        return res.status(400).json({ message: 'Descripción, código y stock son requeridos.' });
    }

    try {
        const query = `
            INSERT INTO productos (code, description, provider, stock, min, max, area)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
        const values = [code, description, provider, Number(stock) || 0, Number(min) || 0, Number(max) || 0, area];

        const result = await insumosPool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

app.put('/api/productos/:id', async (req, res) => {
    const { id } = req.params;
    const { code, description, provider, min, max, area } = req.body;

    if (!description || !code) {
        return res.status(400).json({ message: 'Descripción y código son requeridos.' });
    }

    try {
        const query = `
            UPDATE productos
            SET code = $1, description = $2, provider = $3, min = $4, max = $5, area = $6
            WHERE id = $7
            RETURNING *;
        `;
        const values = [code, description, provider, Number(min) || 0, Number(max) || 0, area, id];

        const result = await insumosPool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Producto no encontrado.' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});



// --- Stock Update Endpoint ---
app.put('/api/productos/:id/stock', async (req, res) => {
    const { id } = req.params;
    const { change, usuario, area } = req.body; // change: +1 or -1

    if (!change || !usuario) {
        return res.status(400).json({ message: 'Cambio y usuario son requeridos.' });
    }

    let client;
    try {
        client = await insumosPool.connect();
        await client.query('BEGIN');

        // 1. Get current product
        const productRes = await client.query('SELECT * FROM productos WHERE id = $1', [id]);
        if (productRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Producto no encontrado.' });
        }
        const product = productRes.rows[0];
        const currentStock = product.stock;
        const newStock = currentStock + change;

        // 2. Update product
        await client.query('UPDATE productos SET stock = $1 WHERE id = $2', [newStock, id]);

        // 3. Insert into historial
        await client.query(`
            INSERT INTO historial (producto_id, usuario, cantidad_anterior, cantidad_nueva, area)
            VALUES ($1, $2, $3, $4, $5)
        `, [id, usuario, currentStock, newStock, area || product.area]);

        await client.query('COMMIT');

        res.status(200).json({ message: 'Stock actualizado', newStock });
    } catch (error) {
        if (client) await client.query('ROLLBACK');
        console.error('Error updating stock:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    } finally {
        if (client) client.release();
    }
});

// --- Areas Endpoint ---
app.get('/api/areas', async (req, res) => {
    try {
        const result = await insumosPool.query('SELECT * FROM areas ORDER BY nombre ASC');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching areas:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// --- History Endpoint ---
app.get('/api/historial', async (req, res) => {
    try {
        const query = `
            SELECT h.*, p.description as producto_descripcion, p.code as producto_codigo
            FROM historial h
            JOIN productos p ON h.producto_id = p.id
            ORDER BY h.fecha DESC
        `;
        const result = await insumosPool.query(query);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// --- Statistics Endpoint ---
app.get('/api/estadisticas/consumo', async (req, res) => {
    const { search, area, startDate, endDate } = req.query;

    try {
        let queryParams = [];
        let paramIndex = 1;

        // Date filtering for the subquery
        let dateCondition = '';
        if (startDate && endDate) {
            dateCondition = `AND h.fecha BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
            queryParams.push(startDate, endDate);
            paramIndex += 2;
        } else if (startDate) {
            dateCondition = `AND h.fecha >= $${paramIndex}`;
            queryParams.push(startDate);
            paramIndex++;
        } else if (endDate) {
            dateCondition = `AND h.fecha <= $${paramIndex}`;
            queryParams.push(endDate);
            paramIndex++;
        }

        // Main query filtering
        let whereConditions = [];
        if (search) {
            whereConditions.push(`(p.description ILIKE $${paramIndex} OR p.code ILIKE $${paramIndex})`);
            queryParams.push(`%${search}%`);
            paramIndex++;
        }
        if (area) {
            whereConditions.push(`p.area = $${paramIndex}`);
            queryParams.push(area);
            paramIndex++;
        }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

        const query = `
            SELECT
                p.id,
                p.code,
                p.description,
                p.area,
                p.stock,
                COALESCE(c.total_consumo, 0) as total_consumo
            FROM
                productos p
            LEFT JOIN (
                SELECT
                    producto_id,
                    SUM(cantidad_anterior - cantidad_nueva) as total_consumo
                FROM
                    historial h
                WHERE
                    cantidad_nueva < cantidad_anterior
                    ${dateCondition}
                GROUP BY
                    producto_id
            ) c ON p.id = c.producto_id
            ${whereClause}
            ORDER BY
                total_consumo DESC, p.description ASC;
        `;
        
        const result = await insumosPool.query(query, queryParams);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching consumption stats:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});


// --- Login Endpoint ---
app.post('/app/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Usuario y contraseña son requeridos.' });
    }

    let client;
    try {
        client = await pool.connect();
        let user = null;
        let userType = null;

        // 1. Check in internal_users
        const internalUserResult = await client.query(
            'SELECT * FROM internal_users WHERE name = $1',
            [username]
        );

        if (internalUserResult.rows.length > 0) {
            const internalUser = internalUserResult.rows[0];
            const decodedPassword = decodeBase64(internalUser.internal_password);
            if (decodedPassword === password) {
                user = { id: internalUser.id, username: internalUser.name };
                userType = 'internal';
            }
        }

        // 2. If not found or password doesn't match, check in odoo_users
        if (!user) {
            const odooUserResult = await client.query(
                'SELECT * FROM odoo_users WHERE username = $1',
                [username]
            );

            if (odooUserResult.rows.length > 0) {
                const odooUser = odooUserResult.rows[0];
                const decodedPassword = decodeBase64(odooUser.password);
                if (decodedPassword === password) {
                    user = { id: odooUser.id, username: odooUser.username };
                    userType = 'odoo';
                }
            }
        }

        // 3. If user is not found in either table
        if (!user) {
            return res.status(401).json({ message: 'Usuario o contraseña incorrectos.' });
        }

        // 4. Fetch user role
        let role = 'Usuario'; // Default role
        let roleQuery = '';
        let queryParams = [];

        if (userType === 'internal') {
            roleQuery = 'SELECT role FROM app_user_roles WHERE internal_user_id = $1 AND application_name = $2';
            queryParams = [user.id, 'app-insumos'];
        } else { // userType === 'odoo'
            roleQuery = 'SELECT role FROM app_user_roles WHERE odoo_user_id = $1 AND application_name = $2';
            queryParams = [user.id, 'app-insumos'];
        }

        const roleResult = await client.query(roleQuery, queryParams);

        if (roleResult.rows.length > 0) {
            role = roleResult.rows[0].role;
        }

        // 5. Successful login
        // Add any other user data you need to return to the frontend
        const userData = {
            ...user,
            role: role,
            appName: 'app-insumos', // As requested
            display_name: user.username
        };

        res.status(200).json(userData);

    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    } finally {
        if (client) {
            client.release();
        }
    }
});

app.listen(port, () => {
    console.log(`Backend server running at http://localhost:${port}`);
});
