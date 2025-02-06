```markdown
# supertienda - eGrocery

supertienda - eGrocery es un sistema de gestión para tiendas de abarrotes que permite manejar inventario, ventas, gastos y más.

## Requisitos previos

Antes de comenzar, asegúrate de tener instalado:

- Node.js (versión 14 o superior)
- npm (normalmente viene con Node.js)
- PostgreSQL

## Instalación

1. Clona este repositorio:
```

git clone [https://github.com/luchinango/supertiendaweb.git](https://github.com/luchinango/supertiendaweb.git)
cd supertiendaweb

```plaintext

2. Instala las dependencias:
```

npm install

```plaintext

3. Configura las variables de entorno:
Crea un archivo `.env` en la raíz del proyecto y añade lo siguiente:
```

DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/supertienda?schema=public"

```plaintext
Reemplaza `usuario`, `contraseña` y `localhost:5432` con tus credenciales de PostgreSQL.

4. Configura la base de datos:
```

npx prisma migrate dev --name init

```plaintext

## Arrancar el proyecto

Para iniciar el servidor de desarrollo:

```

npm run dev

```plaintext

El proyecto estará disponible en `http://localhost:3000`.

## Estructura del proyecto

- `/app`: Contiene las rutas y páginas de la aplicación
- `/components`: Componentes reutilizables de React
- `/lib`: Utilidades y funciones auxiliares
- `/prisma`: Esquema de la base de datos y migraciones

## Tecnologías utilizadas

- Next.js
- React
- Prisma
- PostgreSQL
- Tailwind CSS
- shadcn/ui

## Scripts disponibles

- `npm run dev`: Inicia el servidor de desarrollo
- `npm run build`: Construye la aplicación para producción
- `npm start`: Inicia la aplicación en modo producción
- `npm run lint`: Ejecuta el linter para verificar el código

## Contribuir

Si deseas contribuir al proyecto, por favor crea un Pull Request con tus cambios propuestos.

## Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo `LICENSE` para más detalles.