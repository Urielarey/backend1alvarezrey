const mongoose = require('mongoose');

const connectDB = async () => {
	try {
		// Usar variable de entorno o cadena de conexión por defecto
		const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://byurodev:180222Lucia@ecommerce-cluster.jvt3ofw.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=ecommerce-cluster';
		
		console.log('Intentando conectar a MongoDB...');
		const conn = await mongoose.connect(mongoURI, {
			serverSelectionTimeoutMS: 5000, // Timeout después de 5 segundos
			socketTimeoutMS: 45000, // Cerrar sockets después de 45 segundos de inactividad
		});
		console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
	} catch (error) {
		console.error('\n❌ Error al conectar a MongoDB:', error.message);
		
		// Errores específicos
		if (error.code === 8000 || error.message.includes('authentication failed') || error.message.includes('bad auth')) {
			console.error('\n⚠️  Error de autenticación. Verifica:');
			console.error('1. Que la contraseña en la cadena de conexión sea correcta');
			console.error('2. Que los caracteres especiales en la contraseña estén codificados en URL');
			console.error('   Ejemplo: @ se codifica como %40, # como %23, etc.');
			console.error('3. Que el usuario tenga permisos en MongoDB Atlas');
			console.error('4. Que el usuario no haya sido eliminado o bloqueado');
		} else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
			console.error('\n⚠️  Error de red. Verifica:');
			console.error('1. Tu conexión a internet');
			console.error('2. Que el nombre del cluster sea correcto');
		} else if (error.message.includes('timeout') || error.message.includes('ServerSelectionTimeoutError')) {
			console.error('\n⚠️  Timeout de conexión. Verifica:');
			console.error('1. Que tu IP esté en la whitelist de MongoDB Atlas');
			console.error('2. Ve a MongoDB Atlas > Network Access > Add IP Address');
			console.error('3. Puedes agregar 0.0.0.0/0 para permitir todas las IPs (solo para desarrollo)');
		} else if (error.message.includes('MongoServerError')) {
			console.error('\n⚠️  Error del servidor MongoDB. Verifica:');
			console.error('1. Que el cluster no esté pausado en MongoDB Atlas');
			console.error('2. Que el nombre de la base de datos sea correcto');
		}
		
		console.error('\n💡 Solución:');
		console.error('1. Crea un archivo .env en la raíz del proyecto');
		console.error('2. Agrega: MONGODB_URI=tu_cadena_de_conexion');
		console.error('3. Usa el archivo .env.example como referencia');
		console.error('\n');
		process.exit(1);
	}
};

module.exports = connectDB;

