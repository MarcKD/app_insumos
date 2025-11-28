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
    const { username } = req.query;

    if (!username) {
        return res.status(400).json({ message: 'Usuario requerido para obtener productos.' });
    }

    try {
        // 1. Get user's area info (ID and Name)
        const userAreaQuery = `
            SELECT ua.area_id, a.nombre as area_nombre
            FROM usuario_areas ua
            JOIN areas a ON ua.area_id = a.id
            WHERE ua.username = $1
        `;
        const userAreaResult = await insumosPool.query(userAreaQuery, [username]);

        if (userAreaResult.rows.length === 0) {
            // User has no area assigned -> No products
            return res.status(200).json([]);
        }

        const { area_id, area_nombre } = userAreaResult.rows[0];

        // 2. Fetch products based on area name
        let query;
        let queryParams = [];

        if (area_nombre === 'Sistemas') {
            query = 'SELECT * FROM productos ORDER BY id DESC';
        } else {
            query = 'SELECT * FROM productos WHERE area = $1 ORDER BY id DESC';
            queryParams = [area_nombre];
        }

        const result = await insumosPool.query(query, queryParams);
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
            INSERT INTO historial (producto_id, usuario, cantidad_anterior, cantidad_nueva, area, tipo_movimiento)
            VALUES ($1, $2, $3, $4, $5, 'ajuste')
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

// --- Orders Endpoint ---
app.post('/api/pedidos', async (req, res) => {
    const { items, usuario } = req.body; // items: [{id, suggestedOrder, area}]

    if (!items || !usuario || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'Items y usuario son requeridos.' });
    }

    let client;
    try {
        client = await insumosPool.connect();
        await client.query('BEGIN');

        for (const item of items) {
            // The product should exist, but this check is good practice
            const productRes = await client.query('SELECT area FROM productos WHERE id = $1', [item.id]);
            if (productRes.rows.length === 0) {
                throw new Error(`Producto con ID ${item.id} no encontrado.`);
            }
            const product = productRes.rows[0];

            // Insert into the new InsumosPedidos table
            await client.query(`
                INSERT INTO InsumosPedidos (producto_id, cantidad_pedida, usuario, area)
                VALUES ($1, $2, $3, $4)
            `, [item.id, item.suggestedOrder, usuario, item.area || product.area]);
        }

        await client.query('COMMIT');

        res.status(200).json({ message: 'Pedido registrado correctamente en InsumosPedidos.' });
    } catch (error) {
        if (client) await client.query('ROLLBACK');
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    } finally {
        if (client) client.release();
    }
});

app.get('/api/pedidos', async (req, res) => {
    const { username } = req.query;

    if (!username) {
        return res.status(400).json({ message: 'Usuario requerido.' });
    }

    try {
        // 1. Get user's area info
        const userAreaQuery = `
            SELECT a.nombre as area_nombre
            FROM usuario_areas ua
            JOIN areas a ON ua.area_id = a.id
            WHERE ua.username = $1
        `;
        const userAreaResult = await insumosPool.query(userAreaQuery, [username]);
        
        if (userAreaResult.rows.length === 0) {
            return res.status(200).json([]);
        }
        const userAreaName = userAreaResult.rows[0].area_nombre;

        // 2. Build Query
        let query = `
            SELECT
                ip.id,
                ip.producto_id,
                ip.cantidad_pedida,
                ip.usuario,
                ip.area,
                ip.fecha_pedido,
                p.code AS producto_codigo,
                p.description AS producto_descripcion,
                p.provider AS producto_provider
            FROM
                InsumosPedidos ip
            JOIN
                productos p ON ip.producto_id = p.id
            WHERE
                ip.status = 'pedido'
        `;
        
        let queryParams = [];
        
        if (userAreaName !== 'Sistemas') {
            query += ` AND ip.area = $1`;
            queryParams.push(userAreaName);
        }

        query += ` ORDER BY ip.fecha_pedido DESC;`;

        const result = await insumosPool.query(query, queryParams);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching ordered items:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

app.post('/api/pedidos/:id/recibir', async (req, res) => {
    const { id: pedidoId } = req.params;
    const { usuario } = req.body;

    if (!usuario) {
        return res.status(400).json({ message: 'El usuario es requerido.' });
    }

    let client;
    try {
        client = await insumosPool.connect();
        await client.query('BEGIN');

        // 1. Get order details
        const pedidoRes = await client.query('SELECT * FROM InsumosPedidos WHERE id = $1 AND status = \'pedido\'', [pedidoId]);
        if (pedidoRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Pedido no encontrado o ya ha sido procesado.' });
        }
        const pedido = pedidoRes.rows[0];
        const { producto_id, cantidad_pedida, area } = pedido;

        // 2. Get current product stock
        const productRes = await client.query('SELECT stock FROM productos WHERE id = $1', [producto_id]);
        if (productRes.rows.length === 0) {
            throw new Error(`Producto con ID ${producto_id} no encontrado en la tabla de productos.`);
        }
        const currentStock = productRes.rows[0].stock;
        const newStock = currentStock + cantidad_pedida;

        // 3. Update product stock
        await client.query('UPDATE productos SET stock = $1 WHERE id = $2', [newStock, producto_id]);

        // 4. Log the reception in history
        await client.query(`
            INSERT INTO historial (producto_id, usuario, cantidad_anterior, cantidad_nueva, area, tipo_movimiento)
            VALUES ($1, $2, $3, $4, $5, 'ingreso')
        `, [producto_id, usuario, currentStock, newStock, area]);
        
        // 5. Update the order status
        await client.query('UPDATE InsumosPedidos SET status = \'recibido\', fecha_recepcion = CURRENT_TIMESTAMP WHERE id = $1', [pedidoId]);

        await client.query('COMMIT');

        res.status(200).json({ message: 'Mercadería recibida y stock actualizado.', newStock });
    } catch (error) {
        if (client) await client.query('ROLLBACK');
        console.error('Error receiving goods:', error);
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
    const { username } = req.query;

    if (!username) {
        return res.status(400).json({ message: 'Usuario requerido.' });
    }

    try {
        // 1. Get user's area info
        const userAreaQuery = `
            SELECT a.nombre as area_nombre
            FROM usuario_areas ua
            JOIN areas a ON ua.area_id = a.id
            WHERE ua.username = $1
        `;
        const userAreaResult = await insumosPool.query(userAreaQuery, [username]);
        
        if (userAreaResult.rows.length === 0) {
            return res.status(200).json([]);
        }
        const userAreaName = userAreaResult.rows[0].area_nombre;

        // 2. Build Query
        let query = `
            SELECT h.*, p.description as producto_descripcion, p.code as producto_codigo
            FROM historial h
            JOIN productos p ON h.producto_id = p.id
        `;
        
        let queryParams = [];
        
        if (userAreaName !== 'Sistemas') {
            query += ` WHERE h.area = $1`;
            queryParams.push(userAreaName);
        }

        query += ` ORDER BY h.fecha DESC`;

        const result = await insumosPool.query(query, queryParams);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// --- Statistics Endpoint ---
app.get('/api/estadisticas/consumo', async (req, res) => {
    const { search, area, startDate, endDate, username } = req.query;

    if (!username) {
        return res.status(400).json({ message: 'Usuario requerido.' });
    }

    try {
        // 1. Get user's area info
        const userAreaQuery = `
            SELECT a.nombre as area_nombre
            FROM usuario_areas ua
            JOIN areas a ON ua.area_id = a.id
            WHERE ua.username = $1
        `;
        const userAreaResult = await insumosPool.query(userAreaQuery, [username]);
        
        if (userAreaResult.rows.length === 0) {
            return res.status(200).json([]); // User has no area
        }

        const userAreaName = userAreaResult.rows[0].area_nombre;

        let queryParams = [];
        let paramIndex = 1;
        let whereConditions = [];

        // 2. Restrict Area if not Sistemas
        if (userAreaName !== 'Sistemas') {
             whereConditions.push(`p.area = $${paramIndex}`);
             queryParams.push(userAreaName);
             paramIndex++;
        } else {
             // If Sistemas, allow filtering by requested area name
             if (area) {
                 whereConditions.push(`p.area = $${paramIndex}`);
                 queryParams.push(area);
                 paramIndex++;
             }
        }


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

        // Main query filtering (Search)
        if (search) {
            whereConditions.push(`(p.description ILIKE $${paramIndex} OR p.code ILIKE $${paramIndex})`);
            queryParams.push(`%${search}%`);
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

        // 4.5 Fetch user area from insumos_db
        let userArea = 'General';
        try {
            const areaResult = await insumosPool.query(`
                SELECT a.nombre 
                FROM usuario_areas ua
                JOIN areas a ON ua.area_id = a.id
                WHERE ua.username = $1
            `, [user.username]);
            
            if (areaResult.rows.length > 0) {
                userArea = areaResult.rows[0].nombre;
            }
        } catch (areaError) {
            console.error('Error fetching user area:', areaError);
            // Non-blocking error, proceed without area
        }

        // 5. Successful login
        // Add any other user data you need to return to the frontend
        const userData = {
            ...user,
            role: role,
            area: userArea,
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

app.listen(port, '0.0.0.0', () => {
    console.log(`Backend server running on port ${port}. Accessible on the local network.`);
});
