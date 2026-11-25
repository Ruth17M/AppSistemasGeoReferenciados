# AcopioMap — Centros de acopio georreferenciados

**Proyecto final · Aplicación de Sistemas Georreferenciados**
Leaflet · React (Vite) · Node.js · Express · MongoDB Atlas (Mongoose)

## Problemática

Cuando ocurre un desastre (sismo, inundación, huracán), la ciudadanía abre decenas de
centros de acopio de forma espontánea. La información de **dónde** están, **qué reciben**,
**si ya están saturados** y **qué zonas están afectadas** circula dispersa en redes sociales,
lo que provoca que unos centros se saturen mientras otros —o zonas enteras— se quedan sin apoyo.

**AcopioMap** concentra esa información en un mapa: cada centro de acopio es un punto exacto
con su categoría, estado y organización responsable; las zonas afectadas o de cobertura se
dibujan como polígonos; y con consultas geoespaciales (`$geoWithin`) se sabe cuántos centros
hay dentro de cada zona y cuáles atienden un área en particular.

## Funcionalidades (rúbrica)

| Requisito | Dónde está |
|---|---|
| Inicio de sesión (bcrypt + JWT, mensaje de error claro, rutas protegidas) | `/login`, `backend/src/services/users.service.js`, `middlewares/auth.handler.js` |
| Registro de usuarios (validación, sin correos duplicados, contraseña cifrada) | Pestaña *Crear cuenta* en `/login` |
| 3 CRUD propios + relaciones `ObjectId` + `populate` | **Categorías**, **Organizaciones**, **Insumos** en `/catalogos` |
| Registro de ubicación exacta con clic en el mapa (GeoJSON Point) | `/mapa` → clic en el mapa |
| Edición en el popup | Clic en un pin → **Editar** |
| Eliminación en el popup | Clic en un pin → **Eliminar** |
| Tabla en tiempo real sin el ID (categoría por nombre) | Debajo del mapa; se refresca tras cada cambio y cada 15 s |
| Búsqueda y filtros en el backend (`?search=&category=&status=&zone=`) | Panel *Búsqueda y filtros* |
| Trazo de zonas (GeoJSON Polygon, persisten hasta eliminarlas) | Botones de polígono/rectángulo (Leaflet-Geoman) y panel *Zonas* |
| ≥ 3 vistas, navegación y mensajes de éxito/error | Login, Mapa, Catálogos, Resumen + notificaciones |
| Backend en capas, `AppError`, 404, `errorHandler`, códigos HTTP | `backend/src/*` |

### Relaciones entre entidades (referencias `ObjectId` + `populate`)

```
User ──< Location >── Category
             │  └──── Organization (opcional)
             └──< Supply            (insumo → centro de acopio)
User ──< Zone
```

* `Location.category → Category` (obligatoria)
* `Location.organization → Organization` (opcional)
* `Location.createdBy → User`
* `Supply.location → Location`
* `Zone.createdBy → User`

Reglas de integridad: no se puede borrar una categoría en uso (400); al borrar una
organización los centros quedan "sin asignar"; al borrar un centro se borran sus insumos.

## Estructura del repositorio

```
.
├── backend/                     API REST (Node.js + Express + Mongoose)
│   ├── .env.example
│   └── src/
│       ├── index.js             arranque del servidor (conecta a Mongo y escucha)
│       ├── app.js               middlewares globales, rutas y manejo de errores
│       ├── config/              env.js (variables), database.js (conexión)
│       ├── models/              esquemas Mongoose (user, category, organization,
│       │                        location [Point + 2dsphere], zone [Polygon + 2dsphere], supply)
│       ├── routes/              solo reciben la petición y llaman al servicio
│       ├── services/            lógica y operaciones con MongoDB (uno por entidad)
│       ├── middlewares/         validator.handler, auth.handler, error.handler, schemas/
│       ├── utils/               AppError, jwt, geo, mongoErrors, toJSON
│       └── data/seed.js         datos de ejemplo + usuario de prueba
├── frontend/                    React + Vite + Leaflet (react-leaflet) + Leaflet-Geoman
│   ├── .env.example
│   └── src/
│       ├── api/                 cliente HTTP y servicios por endpoint
│       ├── context/             sesión (AuthContext) y notificaciones (ToastContext)
│       ├── components/          mapa, popups, tabla, filtros, zonas, CRUD reutilizable
│       └── pages/               LoginPage, MapPage, CatalogsPage, SummaryPage
└── render.yaml                  blueprint para desplegar el backend en Render
```

## Ejecutar localmente

Requisitos: Node.js 20 o superior y un clúster de MongoDB Atlas (o MongoDB local).

### 1. Backend

```bash
cd backend
cp .env.example .env      # llena MONGODB_URI y JWT_SECRET con tus datos reales
npm install
npm run seed              # (opcional) carga datos de ejemplo y el usuario de prueba
npm run dev               # http://localhost:3000
```

> ⚠️ `npm run seed` **borra** las colecciones del proyecto antes de insertar los datos de ejemplo.

### 2. Frontend

```bash
cd frontend
cp .env.example .env      # VITE_API_URL=http://localhost:3000/api
npm install
npm run dev               # http://localhost:5173
```

### Usuario de prueba

Después de `npm run seed` existe el usuario (configurable con `SEED_USER_EMAIL` / `SEED_USER_PASSWORD`):

* **Correo:** `demo@acopiomap.mx`
* **Contraseña:** `Demo12345`

## Variables de entorno

**backend/.env**

| Variable | Descripción |
|---|---|
| `PORT` | Puerto de la API (Render lo asigna solo) |
| `MONGODB_URI` | Cadena de conexión de Atlas — **nunca se sube al repositorio** |
| `MONGODB_DB_NAME` | Nombre de la base de datos (por defecto `acopiomap`) |
| `JWT_SECRET` | Secreto para firmar los tokens |
| `JWT_EXPIRES_IN` | Duración de la sesión (por defecto `8h`) |
| `CORS_ORIGIN` | URL(s) del frontend permitidas, separadas por coma |
| `DNS_SERVERS` | Opcional, para redes que bloquean la consulta SRV de `mongodb+srv` |

**frontend/.env**

| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL base de la API, terminada en `/api` |

## API REST

Todas las rutas, excepto `/api/auth/register`, `/api/auth/login` y `/api/health`, requieren
el encabezado `Authorization: Bearer <token>` (si falta o es inválido → **401**).

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/register` | Crear cuenta → 201 / 400 (datos inválidos o correo duplicado) |
| POST | `/api/auth/login` | Iniciar sesión → 200 / 401 |
| GET | `/api/auth/me` | Usuario de la sesión |
| GET | `/api/locations?search=&category=&status=&zone=` | Centros filtrados (con `populate`) |
| GET | `/api/locations/geojson` | Mismo filtro en formato `FeatureCollection` |
| POST / PATCH / DELETE | `/api/locations[/:id]` | Crear / editar / eliminar centro |
| GET / POST / PATCH / DELETE | `/api/zones[/:id]` | Zonas (Polygon) + conteo de centros dentro |
| GET / POST / PATCH / DELETE | `/api/categories[/:id]` | CRUD de categorías |
| GET / POST / PATCH / DELETE | `/api/organizations[/:id]` | CRUD de organizaciones |
| GET / POST / PATCH / DELETE | `/api/supplies[/:id]?location=&priority=` | CRUD de insumos |

Formato de error (centralizado en `errorHandler`):

```json
{ "error": 400, "message": "La información enviada no es válida",
  "details": ["El campo \"nombre\" es obligatorio"], "path": "/api/locations", "timestamp": "..." }
```

Códigos usados: **200** (consulta/edición/eliminación), **201** (creación), **400** (validación,
JSON mal formado, duplicados, referencias inexistentes), **401** (sin sesión o credenciales
incorrectas), **404** (ruta o registro inexistente), **500** (error no controlado).

### Datos geográficos

* Ubicaciones: `{ type: "Point", coordinates: [longitud, latitud] }` con índice `2dsphere`.
* Zonas: `{ type: "Polygon", coordinates: [[[lng, lat], ..., [lng, lat]]] }` con índice `2dsphere`;
  el backend cierra el anillo (primer vértice = último).
* Leaflet trabaja en `[lat, lng]`; la conversión se hace en `ZoneDrawControl.jsx` (al guardar)
  y en `MapView.jsx` (al dibujar lo que viene de la API).
* Filtro por zona: `{ location: { $geoWithin: { $geometry: zona.area } } }`.

## Despliegue

1. **MongoDB Atlas:** crear clúster gratuito, usuario de base de datos y permitir el acceso
   de red (`0.0.0.0/0` para Render). Copiar la cadena `mongodb+srv://...`.
2. **Backend en Render:** *New → Blueprint* apuntando a este repositorio (usa `render.yaml`)
   o *New → Web Service* con *Root Directory* `backend`, build `npm install`, start `npm start`.
   Capturar `MONGODB_URI`, `JWT_SECRET` y `CORS_ORIGIN` (URL del frontend) en *Environment*.
   Ejecutar una vez `npm run seed` (desde tu equipo con la misma `MONGODB_URI`) para tener
   el usuario de prueba con datos.
3. **Frontend en Vercel:** importar el repositorio con *Root Directory* `frontend`
   (preset Vite) y la variable `VITE_API_URL=https://<tu-backend>.onrender.com/api`.
   `vercel.json` redirige todas las rutas a `index.html` (en Netlify lo hace `public/_redirects`).
4. Actualizar `CORS_ORIGIN` en Render con la URL final de Vercel.

## Seguridad

* Contraseñas cifradas con **bcrypt** (`bcryptjs`, 10 rondas); el campo `password` tiene
  `select: false` y nunca se devuelve en las respuestas.
* Sesión con **JWT**; el frontend guarda el token y cierra sesión si la API responde 401.
* Credenciales y cadena de conexión solo en `.env` (ignorado por git); el repositorio incluye
  únicamente `.env.example` sin datos reales.
