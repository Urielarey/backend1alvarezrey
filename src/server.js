// Cargar variables de entorno primero
require('dotenv').config();

const express = require('express');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');
const exphbs = require('express-handlebars');
const connectDB = require('./config/database');
const passport = require('./config/passport.config');

const productsRouter = require('./routes/products.router');
const cartsRouter = require('./routes/carts.router');
const viewsRouter = require('./routes/views.router');
const usersRouter = require('./routes/users.router');
const sessionsRouter = require('./routes/sessions.router');

// Conectar a MongoDB
connectDB();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

// Configurar Handlebars
const hbs = exphbs.create({
	defaultLayout: false,
	extname: '.handlebars',
	helpers: {
		eq: function(a, b) {
			return a === b;
		},
		multiply: function(a, b) {
			return (a * b).toFixed(2);
		},
		calculateTotal: function(products) {
			if (!products || !Array.isArray(products)) return '0.00';
			let total = 0;
			products.forEach(item => {
				if (item.product && item.product.price) {
					total += item.product.price * item.quantity;
				}
			});
			return total.toFixed(2);
		}
	}
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Inicializar Passport
app.use(passport.initialize());

// Hacer io disponible en las rutas
app.set('io', io);

// Routers
app.use('/', viewsRouter);
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/api/users', usersRouter);
app.use('/api/sessions', sessionsRouter);

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
