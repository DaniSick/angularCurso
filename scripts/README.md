# Scripts para la base de datos

Este directorio contiene scripts para gestionar la base de datos del proyecto.

## Descripción de los scripts

- `syncDatabase.js`: Crea y sincroniza la estructura de la base de datos
- `seedDatabase.js`: Inserta datos de ejemplo en la base de datos
- `check-database.js`: Verifica la conexión y el estado de la base de datos
- `seed-server.js`: Ejecuta el seed a través del servidor API

## Instrucciones de uso

### 1. Sincronizar la base de datos (crear tablas)

```bash
node scripts/syncDatabase.js
```

Este comando creará la estructura de tablas en la base de datos. **Advertencia**: La opción `force: true` borrará todas las tablas existentes y creará nuevas.

### 2. Sembrar la base de datos

```bash
node scripts/seedDatabase.js
```

Este comando insertará 5000 usuarios de ejemplo en la base de datos.

### 3. Verificar el estado de la base de datos

```bash
node scripts/check-database.js
```

Este comando comprobará si la conexión con la base de datos está funcionando correctamente y mostrará un ejemplo de los datos.

### 4. Sembrar a través del servidor API

```bash
node scripts/seed-server.js
```

Este comando envía una solicitud al servidor para que ejecute el proceso de seed (requiere que el endpoint `/seed` esté implementado en el servidor).

## Solución de problemas

Si encuentras errores, verifica:

1. Que el servidor de base de datos esté en ejecución
2. Que las credenciales en `config/database.js` sean correctas
3. Que la base de datos especificada exista
4. Que tengas permisos para acceder y modificar la base de datos
