# Fibrarte

Plataforma web para Fibrarte — productos artesanales personalizados en MDF y fibrofácil. Desarrollado con Next.js 14, TypeScript, Tailwind CSS, MySQL y Prisma.

## Stack

- **Frontend/Backend**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS v3
- **Base de datos**: MySQL 8
- **ORM**: Prisma
- **Infraestructura**: Docker + docker-compose

## Primeros pasos

### Opción A: Desarrollo local (recomendado)

**Requisitos previos:**
- Node.js 18+
- Docker y docker-compose (para MySQL)

**1. Clonar e instalar dependencias**
```bash
npm install
```

**2. Configurar variables de entorno**
```bash
cp .env.example .env
```

Editá el archivo `.env` con tus valores (el `.env` ya viene con valores de desarrollo listos).

**3. Iniciar solo MySQL con Docker**
```bash
docker-compose up -d mysql
```

**4. Ejecutar migraciones de base de datos**
```bash
npm run db:migrate
```

**5. Cargar datos de ejemplo**
```bash
npm run db:seed
```

**6. Iniciar el servidor de desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

---

### Opción B: Setup automatizado

```bash
bash scripts/setup.sh
npm run dev
```

---

### Opción C: Docker completo (producción)

```bash
docker-compose up --build
```

Esto levanta tanto MySQL como la aplicación Next.js.

---

## Acceso al panel de administración

- URL: [http://localhost:3000/admin](http://localhost:3000/admin)
- Usuario: `admin123`
- Contraseña: `password123`

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Servidor de producción |
| `npm run db:migrate` | Ejecutar migraciones |
| `npm run db:generate` | Generar cliente Prisma |
| `npm run db:studio` | Abrir Prisma Studio |
| `npm run db:seed` | Cargar datos de ejemplo |

## Logo

El logo debe estar en `public/img/logo/logo.png`. 

Si tenés el archivo original `ChatGPT Image May 10, 2026, 11_09_20 PM.png`, copialo y renombralo:
```bash
cp "ChatGPT Image May 10, 2026, 11_09_20 PM.png" public/img/logo/logo.png
```

## Estructura del proyecto

```
fibrarte/
├── prisma/
│   ├── schema.prisma       # Esquema de base de datos
│   └── seed.ts             # Datos de ejemplo
├── src/
│   ├── app/
│   │   ├── api/            # API Routes
│   │   │   ├── auth/       # Login, logout, me
│   │   │   ├── products/   # CRUD productos
│   │   │   ├── categories/ # Listado categorías
│   │   │   └── upload/     # Subida de imágenes
│   │   ├── admin/          # Panel de administración
│   │   └── page.tsx        # Página principal
│   ├── components/
│   │   ├── admin/          # Componentes del panel admin
│   │   ├── Navbar.tsx
│   │   ├── Hero.tsx
│   │   ├── AboutSection.tsx
│   │   ├── ProductCard.tsx
│   │   ├── ProductsSection.tsx
│   │   ├── ContactSection.tsx
│   │   └── Footer.tsx
│   ├── lib/
│   │   ├── prisma.ts       # Cliente Prisma singleton
│   │   └── auth.ts         # JWT utilities
│   └── middleware.ts       # Protección de rutas admin
├── public/
│   ├── uploads/            # Imágenes subidas
│   └── img/logo/           # Logo
├── docker-compose.yml
├── Dockerfile
└── .env.example
```

## Contacto y redes

- WhatsApp: +54 9 387 571-7430
- Instagram: [@fibrarte.stores](https://www.instagram.com/fibrarte.stores/)
- Ubicación: Salta Capital, Argentina
