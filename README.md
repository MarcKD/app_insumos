📦 app-insumos

Bienvenido al repositorio de app-insumos, una aplicación web moderna diseñada para optimizar el control de inventario, gestión de stock y pedidos de insumos empresariales.

🚀 Características Principales

Dashboard Interactivo: Vista general del estado del inventario.

Gestión de Stock: Visualización de insumos con indicadores de alertas (semáforo) para stock bajo.

Buscador Inteligente: Filtrado en tiempo real por descripción, código, proveedor o área (incluso con palabras desordenadas).

Sistema "A Pedir": Cálculo automático de cantidades de compra basado en mínimos y máximos establecidos.

Seguridad: Módulo de autenticación (Login) para proteger el acceso.

🛠️ Tecnologías Utilizadas

Este proyecto está construido con un stack moderno enfocado en el rendimiento y la experiencia de usuario:

Frontend: React (v18+)

Lenguaje: JavaScript (ES6+)

Estilos: Tailwind CSS (Diseño responsivo y utilitario)

Iconos: Lucide React

Empaquetador: Vite

📂 Estructura del Proyecto

El proyecto sigue una arquitectura modular para facilitar el mantenimiento:

app_insumos/
├── src/
│   ├── assets/         # Imágenes y recursos estáticos
│   ├── components/     # Componentes reutilizables (Navbar, Modals, Tables)
│   ├── pages/          # Vistas principales (Inicio, APedir, Historial)
│   ├── context/        # Manejo del estado global (AuthContext)
│   ├── App.jsx         # Componente raíz
│   └── main.jsx        # Punto de entrada
├── public/             # Archivos públicos
├── package.json        # Dependencias y scripts del proyecto
├── tailwind.config.js  # Configuración de estilos
└── README.md           # Documentación


🔧 Instalación y Uso

Para correr este proyecto localmente, necesitas tener instalado Node.js.

Clonar el repositorio:

git clone [https://github.com/marckd/app_insumos.git](https://github.com/marckd/app_insumos.git)
cd app_insumos


Instalar dependencias:

npm install


Iniciar el servidor de desarrollo:

npm run dev


Abrir en el navegador:
Visita http://localhost:5173 (o el puerto que indique la terminal).

🤝 Contribución

Haz un Fork del proyecto.

Crea una rama para tu funcionalidad (git checkout -b feature/NuevaFuncionalidad).

Haz Commit de tus cambios (git commit -m 'Agregada nueva funcionalidad').

Haz Push a la rama (git push origin feature/NuevaFuncionalidad).

Abre un Pull Request.

Desarrollado para la gestión eficiente de insumos.