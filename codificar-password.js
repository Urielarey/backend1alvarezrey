// Script para codificar caracteres especiales en contraseñas de MongoDB
// Uso: node codificar-password.js "tu@contraseña#123"

const password = process.argv[2];

if (!password) {
	console.log('Uso: node codificar-password.js "tu-contraseña"');
	process.exit(1);
}

// Codificar caracteres especiales en URL
const encoded = encodeURIComponent(password);
console.log('\n📝 Contraseña original:', password);
console.log('🔐 Contraseña codificada:', encoded);
console.log('\n💡 Usa la contraseña codificada en tu archivo .env\n');
console.log('Ejemplo de cadena de conexión:');
console.log(`MONGODB_URI=mongodb+srv://byurodev:${encoded}@ecommerce-cluster.sxkw0ou.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=ecommerce-cluster\n`);

