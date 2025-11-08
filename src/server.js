const express = require('express');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');
const exphbs = require('express-handlebars');

const productsRouter = require('./routes/products.router');
const cartsRouter = require('./routes/carts.router');
const viewsRouter = require('./routes/views.router');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

// Configurar Handlebars
const hbs = exphbs.create({
	defaultLayout: false,
	extname: '.handlebars'
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Hacer io disponible en las rutas
app.set('io', io);

// Routers
app.use('/', viewsRouter);
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
httpServer.listen(PORT, () => {
	console.log(`Servidor escuchando en puerto ${PORT}`);
});
