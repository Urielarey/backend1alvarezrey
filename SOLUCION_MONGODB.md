# Solución de Problemas de Conexión a MongoDB

## Problemas Comunes y Soluciones

### 1. Error de Autenticación (Authentication Failed)

**Causa:** Usuario o contraseña incorrectos, o caracteres especiales sin codificar.

**Solución:**
- Verifica que el usuario y contraseña sean correctos en MongoDB Atlas
- Si tu contraseña tiene caracteres especiales (@, #, %, etc.), debes codificarlos en URL:
  - `@` → `%40`
  - `#` → `%23`
  - `%` → `%25`
  - `&` → `%26`
  - `+` → `%2B`
  - `/` → `%2F`
  - `=` → `%3D`
  - `?` → `%3F`

**Ejemplo:**
Si tu contraseña es `Mi@Pass#123`, la cadena de conexión debería ser:
```
mongodb+srv://usuario:Mi%40Pass%23123@cluster.mongodb.net/db
```

### 2. Error de Timeout o IP no permitida

**Causa:** Tu IP no está en la whitelist de MongoDB Atlas.

**Solución:**
1. Ve a MongoDB Atlas → **Network Access**
2. Haz clic en **Add IP Address**
3. Opciones:
   - **Para desarrollo:** Agrega `0.0.0.0/0` (permite todas las IPs - solo para desarrollo)
   - **Para producción:** Agrega tu IP específica
4. Espera unos minutos para que los cambios se apliquen

### 3. Cluster Pausado

**Causa:** El cluster de MongoDB Atlas está pausado (gratis se pausa después de inactividad).

**Solución:**
1. Ve a MongoDB Atlas → **Clusters**
2. Si el cluster está pausado, haz clic en **Resume**
3. Espera a que el cluster se reactive (puede tomar unos minutos)

### 4. Usar Variables de Entorno (Recomendado)

**Crear archivo `.env` en la raíz del proyecto:**

```env
MONGODB_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/nombre-db?retryWrites=true&w=majority
JWT_SECRET=tu_secret_key_super_segura
```

**Importante:** 
- El archivo `.env` ya está en `.gitignore`, así que no se subirá a Git
- Reemplaza `usuario`, `contraseña`, `cluster` y `nombre-db` con tus valores reales
- Si la contraseña tiene caracteres especiales, codifícalos en URL

### 5. Obtener Nueva Cadena de Conexión

1. Ve a MongoDB Atlas → **Database** → **Connect**
2. Selecciona **Connect your application**
3. Copia la cadena de conexión
4. Reemplaza `<password>` con tu contraseña (codificada si tiene caracteres especiales)
5. Reemplaza `<dbname>` con el nombre de tu base de datos (ej: `ecommerce`)

## Verificar la Conexión

Después de aplicar las soluciones, reinicia el servidor:

```bash
npm run dev
```

Deberías ver el mensaje:
```
✅ MongoDB conectado: ...
```

## Ayuda Adicional

Si el problema persiste:
1. Verifica que MongoDB Atlas esté funcionando: https://status.mongodb.com/
2. Revisa los logs del servidor para ver el error específico
3. Verifica que la versión de mongoose sea compatible


