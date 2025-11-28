# 📦 app-insumos

Bienvenido al repositorio de **app-insumos**, una aplicación web moderna diseñada para optimizar el control de inventario, gestión de stock y pedidos de insumos empresariales.

## 🚀 Características Principales

*   **Dashboard Interactivo:** Vista general del estado del inventario.
*   **Gestión de Stock:** Visualización de insumos con indicadores de alertas (semáforo) para stock bajo.
*   **Buscador Inteligente:** Filtrado en tiempo real por descripción, código, proveedor o área.
*   **Sistema "A Pedir":** Cálculo automático de cantidades de compra basado en mínimos y máximos.
*   **Historial de Movimientos:** Registro detallado de quién modificó el stock y para qué área.
*   **Seguridad:** Módulo de autenticación integrado con usuarios internos y Odoo.

## 🛠️ Tecnologías Utilizadas

Este proyecto es full-stack, utilizando tecnologías modernas:

**Frontend:**
*   React (v18+)
*   Tailwind CSS (Estilos)
*   Lucide React (Iconos)
*   Vite (Build tool)

**Backend:**
*   Node.js
*   Express.js
*   PostgreSQL (`pg` driver)

## ⚙️ Configuración de Usuarios y Áreas (Importante)

Para que el historial de movimientos refleje correctamente el área operativa (ej. Depósito, Ventas, Limpieza), cada usuario debe tener asignada un área en la base de datos.

### Asignación de Áreas

Se ha incluido un script de utilidad para facilitar esta tarea sin acceder directamente a la base de datos.

**Uso del comando:**
```bash
node assign_user_area.cjs <email_o_usuario> <nombre_area_o_id>
```

**Ejemplos:**

1.  Asignar el área "Deposito" al usuario `deposito@wstandard.com.ar`:
    ```bash
    node assign_user_area.cjs deposito@wstandard.com.ar Deposito
    ```

2.  Asignar usando el ID del área (si se conoce):
    ```bash
    node assign_user_area.cjs usuario.nuevo 4
    ```

**Áreas disponibles (IDs comunes):**
*   1: Sistemas
*   2: Deposito
*   3: Full
*   4: Catalogación
*   5: Distri
*   6: MercadoLibre
*   7: Recepción
*   8: Limpieza
*   9: Administración

> **Nota:** Los usuarios deben volver a iniciar sesión para que los cambios de área surtan efecto.

## 📂 Estructura y Scripts de Mantenimiento

Además del código fuente principal, en la raíz del proyecto encontrarás scripts `.cjs` útiles para el mantenimiento de la base de datos:

*   `server.js`: El servidor principal de la aplicación.
*   `assign_user_area.cjs`: Asigna áreas a usuarios (ver arriba).
*   `check_db.cjs` / `check_tables.cjs`: Diagnóstico de tablas y conexión.
*   `create_*.cjs`: Scripts de migración para crear tablas (`historial`, `pedidos`, `usuario_areas`).
*   `fix_*.cjs`: Scripts para correcciones puntuales en datos o estructura.

## 🔧 Instalación y Ejecución

1.  **Instalar dependencias:**
    ```bash
    npm install
    ```

2.  **Base de Datos:**
    Asegúrate de tener acceso a la instancia de PostgreSQL configurada en `server.js`.

3.  **Ejecución (Desarrollo):**
    Para levantar tanto el frontend como el backend simultáneamente (recomendado):
    ```bash
    npm run dev:network
    ```

    O individualmente:
    *   Backend: `npm run start:backend`
    *   Frontend: `npm run dev`

4.  **Acceso:**
    La aplicación estará disponible generalmente en `http://localhost:5173`.

## 🤝 Contribución

1.  Haz un Fork del proyecto.
2.  Crea una rama para tu funcionalidad (`git checkout -b feature/NuevaFuncionalidad`).
3.  Haz Commit de tus cambios (`git commit -m 'Agregada nueva funcionalidad'`).
4.  Abre un Pull Request.

---
Desarrollado para la gestión eficiente de insumos.
