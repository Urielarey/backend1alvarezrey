// Script para probar la conexión a MongoDB
// Uso: node test-mongodb-connection.js "tu-contraseña"

require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

const password = process.argv[2] || process.env.MONGODB_PASSWORD || '180222Lucia';

// Construir la URI con la contraseña
const uri = `mongodb+srv://byurodev:${password}@ecommerce-cluster.sxkw0ou.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=ecommerce-cluster`;

console.log('🔌 Intentando conectar a MongoDB...');
console.log('📝 Usuario: byurodev');
console.log('🔐 Contraseña: ' + '*'.repeat(password.length));
console.log('🌐 Cluster: ecommerce-cluster.sxkw0ou.mongodb.net\n');

const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	}
});

async function run() {
	try {
		await client.connect();
		await client.db("admin").command({ ping: 1 });
		console.log('✅ ¡Conexión exitosa! MongoDB está funcionando correctamente.\n');
		console.log('💡 Ahora actualiza el archivo .env con esta contraseña:\n');
		console.log(`MONGODB_URI=mongodb+srv://byurodev:${password}@ecommerce-cluster.sxkw0ou.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=ecommerce-cluster\n`);
	} catch (error) {
		console.error('❌ Error de conexión:', error.message);
		if (error.message.includes('authentication failed') || error.message.includes('bad auth')) {
			console.error('\n⚠️  La contraseña es incorrecta o el usuario no existe.');
			console.error('💡 Solución:');
			console.error('1. Ve a MongoDB Atlas > Database Access');
			console.error('2. Edita el usuario "byurodev" o crea uno nuevo');
			console.error('3. Obtén o resetea la contraseña');
			console.error('4. Ejecuta este script de nuevo con la contraseña correcta:');
			console.error('   node test-mongodb-connection.js "tu-contraseña-correcta"\n');
		}
	} finally {
		await client.close();
	}
}

run().catch(console.error);

