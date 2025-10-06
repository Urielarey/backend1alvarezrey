const express = require('express');
const path = require('path');

const productsRouter = require('./routes/products.router');
const cartsRouter = require('./routes/carts.router');

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routers
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Healthcheck
app.get('/health', (req, res) => {
	res.json({ status: 'ok' });
});

// Not found
app.use((req, res) => {
	res.status(404).json({ error: 'Ruta no encontrada' });
});

// Error handler
app.use((err, req, res, next) => {
	console.error(err);
	res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
	console.log(`Servidor escuchando en puerto ${PORT}`);
});
