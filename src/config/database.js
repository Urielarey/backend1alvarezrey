const mongoose = require('mongoose');

const connectDB = async () => {
	try {
		// Usar variable de entorno o cadena de conexión por defecto
		const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://byurodev:180222Lucia@ecommerce-cluster.jvt3ofw.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=ecommerce-cluster';
		const conn = await mongoose.connect(mongoURI);
		console.log(`MongoDB conectado: ${conn.connection.host}`);
	} catch (error) {
		console.error('Error al conectar a MongoDB:', error.message);
		if (error.code === 8000 || error.message.includes('authentication failed')) {
			console.error('\n⚠️  Error de autenticación. Verifica:');
			console.error('1. Que la contraseña en la cadena de conexión sea correcta');
			console.error('2. Que los caracteres especiales estén codificados en URL');
			console.error('3. Que el usuario tenga permisos en MongoDB Atlas');
			console.error('\nPuedes configurar MONGODB_URI en un archivo .env para mayor seguridad\n');
		}
		process.exit(1);
	}
};

module.exports = connectDB;

