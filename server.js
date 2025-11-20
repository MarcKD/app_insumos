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

// --- Helper to decode Base64 ---
const decodeBase64 = (encoded) => Buffer.from(encoded, 'base64').toString('utf-8');

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
