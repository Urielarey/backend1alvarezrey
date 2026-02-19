# API de Ecommerce - Arquitectura Mejorada

Servidor Express con arquitectura profesional implementando patrones de diseño, manejo de roles y autorización, sistema de recuperación de contraseña y lógica de compra mejorada.

## Arquitectura

El proyecto implementa una arquitectura en capas siguiendo patrones de diseño profesionales:

### Estructura de Carpetas

```
src/
├── config/          # Configuración (database, passport)
├── controllers/     # Controladores (lógica de endpoints)
├── dao/            # Data Access Objects (acceso a datos)
├── dto/            # Data Transfer Objects (transferencia de datos)
├── middlewares/    # Middlewares (autorización, autenticación)
├── models/         # Modelos de Mongoose
├── repositories/   # Repositories (lógica de negocio)
├── routes/         # Rutas de Express
├── services/       # Servicios (email, compras)
└── utils/          # Utilidades (JWT)
```

### Patrones Implementados

1. **Repository Pattern**: Separa la lógica de acceso a datos (DAO) de la lógica de negocio (Repository)
2. **DAO Pattern**: Abstrae el acceso a la base de datos
3. **DTO Pattern**: Transfiere solo la información necesaria entre capas
4. **Service Pattern**: Encapsula lógica de negocio compleja (compras, emails)

## Scripts

- `npm run dev`: inicia el servidor con nodemon
- `npm start`: inicia el servidor con node

## Variables de Entorno

Crear un archivo `.env` con las siguientes variables:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/ecommerce

# JWT
JWT_SECRET=tu_secret_key_super_segura_cambiar_en_produccion

# Server
PORT=8080
BASE_URL=http://localhost:8080

# Email Configuration (para recuperación de contraseña)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_app_password
EMAIL_FROM=noreply@ecommerce.com
```

## Endpoints

### Sesiones (`/api/sessions`)

- `POST /register` - Registrar un nuevo usuario
- `POST /login` - Iniciar sesión
- `GET /current` - Obtener usuario actual (requiere autenticación) - **Retorna DTO sin información sensible**
- `POST /forgot-password` - Solicitar recuperación de contraseña
- `POST /reset-password` - Restablecer contraseña con token

### Productos (`/api/products`)

- `GET /` - Listar productos (público)
- `GET /:pid` - Obtener producto por ID (público)
- `POST /` - Crear producto (**solo admin**)
- `PUT /:pid` - Actualizar producto (**solo admin**)
- `DELETE /:pid` - Eliminar producto (**solo admin**)

### Carritos (`/api/carts`)

- `POST /` - Crear carrito
- `GET /:cid` - Obtener carrito por ID
- `POST /:cid/product/:pid` - Agregar producto al carrito (**solo usuarios**)
- `DELETE /:cid/products/:pid` - Eliminar producto del carrito
- `PUT /:cid` - Actualizar carrito
- `PUT /:cid/products/:pid` - Actualizar cantidad de producto
- `DELETE /:cid` - Vaciar carrito
- `POST /:cid/purchase` - Procesar compra (requiere autenticación) - **Genera Ticket**

### Usuarios (`/api/users`)

- `GET /` - Obtener todos los usuarios (requiere autenticación)
- `GET /:uid` - Obtener usuario por ID (requiere autenticación)
- `POST /` - Crear usuario (**solo admin**)
- `PUT /:uid` - Actualizar usuario (**solo admin**)
- `DELETE /:uid` - Eliminar usuario (**solo admin**)

## Autenticación y Autorización

### Autenticación

Los endpoints protegidos requieren un token JWT en el header:
```
Authorization: Bearer <token>
```

### Roles

- **user**: Usuario regular (puede agregar productos a su carrito)
- **admin**: Administrador (puede crear, actualizar y eliminar productos)

### Middlewares de Autorización

- `authenticate`: Verifica que el usuario esté autenticado
- `requireAdmin`: Requiere que el usuario sea administrador
- `requireUser`: Requiere que el usuario sea un usuario regular

## Sistema de Recuperación de Contraseña

1. **Solicitar recuperación**: `POST /api/sessions/forgot-password`
   ```json
   {
     "email": "usuario@example.com"
   }
   ```

2. El sistema envía un email con un enlace que expira en 1 hora

3. **Restablecer contraseña**: `POST /api/sessions/reset-password`
   ```json
   {
     "token": "token_recibido_por_email",
     "newPassword": "nueva_contraseña"
   }
   ```

**Características**:
- El enlace expira después de 1 hora
- No permite restablecer a la misma contraseña anterior
- Envía email con botón para restablecer

## Sistema de Compras

### Proceso de Compra

1. El usuario agrega productos a su carrito
2. Al procesar la compra (`POST /api/carts/:cid/purchase`):
   - Se verifica el stock de cada producto
   - Se crea un **Ticket** con los productos disponibles
   - Se actualiza el stock de los productos comprados
   - Los productos sin stock suficiente permanecen en el carrito

### Modelo Ticket

El ticket contiene:
- `code`: Código único generado automáticamente
- `purchase_datetime`: Fecha y hora de la compra
- `amount`: Monto total de la compra
- `purchaser`: ID del usuario que realizó la compra
- `products`: Array de productos comprados con cantidad y precio

### Respuesta de Compra

```json
{
  "status": "success",
  "message": "Compra procesada exitosamente",
  "payload": {
    "ticket": {
      "code": "TICKET-1234567890-ABC123",
      "amount": 1500.00,
      "products": [...]
    },
    "productsNotPurchased": [
      {
        "productId": "...",
        "productTitle": "Producto sin stock",
        "requestedQuantity": 5,
        "availableStock": 2,
        "reason": "Stock insuficiente"
      }
    ]
  }
}
```

## DTO (Data Transfer Objects)

El endpoint `/api/sessions/current` retorna un DTO que contiene solo:
- `id`
- `first_name`
- `last_name`
- `email`
- `age`
- `role`
- `cart`
- `createdAt`
- `updatedAt`

**No incluye información sensible** como la contraseña.

## Ejemplo de Registro

```json
POST /api/sessions/register
{
  "first_name": "Juan",
  "last_name": "Pérez",
  "email": "juan@example.com",
  "age": 25,
  "password": "password123"
}
```

## Ejemplo de Creación de Producto (Admin)

```json
POST /api/products
Authorization: Bearer <token_admin>
{
  "title": "Producto 1",
  "description": "Descripción del producto",
  "code": "P1",
  "price": 100,
  "status": true,
  "stock": 10,
  "category": "categoria",
  "thumbnails": ["/imgs/1.png"]
}
```

## Dependencias Principales

- `express`: Framework web
- `mongoose`: ODM para MongoDB
- `passport` + `passport-jwt`: Autenticación JWT
- `bcrypt`: Encriptación de contraseñas
- `nodemailer`: Envío de emails
- `jsonwebtoken`: Generación y verificación de tokens JWT
- `socket.io`: Comunicación en tiempo real

## Notas

- Los Managers antiguos (`ProductManager`, `CartManager`) se mantienen para compatibilidad con vistas, pero se recomienda usar los Repositories
- El sistema de recuperación de contraseña requiere configuración de email válida
- Los tokens de recuperación expiran después de 1 hora
- La lógica de compra maneja compras parciales (solo productos con stock disponible)
