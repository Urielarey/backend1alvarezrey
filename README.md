# API de Productos y Carritos

Servidor Express (puerto 8080) con persistencia en archivos JSON (`src/data/products.json`, `src/data/carts.json`).

## Scripts

- `npm run dev`: inicia el servidor con nodemon
- `npm start`: inicia el servidor con node

## Endpoints

Productos (`/api/products`):
- GET `/` listar todos
- GET `/:pid` obtener por id
- POST `/` crear producto
- PUT `/:pid` actualizar producto (no cambia `id`)
- DELETE `/:pid` eliminar producto

Carritos (`/api/carts`):
- POST `/` crear carrito
- GET `/:cid` listar productos del carrito
- POST `/:cid/product/:pid` agregar producto (incrementa `quantity` si ya existe)

## Ejemplo de creación de producto (POST /api/products)
```json
{
  "title": "Producto 1",
  "description": "Desc",
  "code": "P1",
  "price": 100,
  "status": true,
  "stock": 10,
  "category": "cat",
  "thumbnails": ["/imgs/1.png"]
}
```
# backend1alvarezrey
