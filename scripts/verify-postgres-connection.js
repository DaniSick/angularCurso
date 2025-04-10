const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

console.log('=== VERIFICACIÓN DE CONEXIÓN A POSTGRESQL ===');

// Cargar configuración desde el archivo
const configPath = path.join(__dirname, '..', 'config', 'db-config.json');
let config;

try {
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  console.log('Configuración cargada desde config/db-config.json');
} catch (error) {
  console.error('Error al cargar la configuración:', error.message);
  console.log('Creando configuración predeterminada basada en la inspección del contenedor');
  
  // Configuración detectada durante la inspección
  config = {
    host: 'localhost',
    port: 5432,
    database: 'my_database',
    user: 'admin',
    password: 'admin'
  };
  
  // Guardar esta configuración para uso futuro
  try {
    const configDir = path.dirname(configPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log('Configuración guardada en config/db-config.json');
  } catch (saveError) {
    console.error('Error al guardar la configuración:', saveError.message);
  }
}

console.log('\nIntentando conectar con la siguiente configuración:');
console.log(`Host: ${config.host}`);
console.log(`Puerto: ${config.port}`);
console.log(`Base de datos: ${config.database}`);
console.log(`Usuario: ${config.user}`);
console.log(`Contraseña: ${'*'.repeat(config.password.length)}`);

async function verifyConnection() {
  const client = new Client({
    ...config,
    connectionTimeoutMillis: 5000
  });
  
  try {
    // Intentar conectar
    await client.connect();
    console.log('\n✅ Conexión exitosa a PostgreSQL!');
    
    // Verificar versión de PostgreSQL
    const versionResult = await client.query('SELECT version()');
    console.log('\nInformación del servidor PostgreSQL:');
    console.log(versionResult.rows[0].version);
    
    // Intentar crear la tabla users si no existe
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100) NOT NULL,
          password VARCHAR(100) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('\n✅ Tabla "users" verificada/creada correctamente');
      
      // Verificar si hay datos en la tabla
      const countResult = await client.query('SELECT COUNT(*) FROM users');
      const recordCount = parseInt(countResult.rows[0].count);
      
      console.log(`Número de registros en la tabla users: ${recordCount}`);
      
      if (recordCount === 0) {
        console.log('\nLa tabla está vacía. Insertando datos de ejemplo...');
        
        // Insertar algunos datos de ejemplo
        const insertResult = await client.query(`
          INSERT INTO users (name, email, password, created_at, updated_at)
          VALUES 
            ('Usuario 1', 'usuario1@example.com', 'password1', NOW(), NOW()),
            ('Usuario 2', 'usuario2@example.com', 'password2', NOW(), NOW()),
            ('Usuario 3', 'usuario3@example.com', 'password3', NOW(), NOW()),
            ('Usuario 4', 'usuario4@example.com', 'password4', NOW(), NOW()),
            ('Usuario 5', 'usuario5@example.com', 'password5', NOW(), NOW())
          ON CONFLICT (id) DO NOTHING
          RETURNING id
        `);
        
        console.log(`✅ ${insertResult.rowCount} registros insertados en la tabla users`);
      }
      
      // Mostrar algunos datos de la tabla
      const sampleResult = await client.query('SELECT * FROM users LIMIT 3');
      console.log('\nMuestra de datos:');
      console.log(JSON.stringify(sampleResult.rows, null, 2));
      
    } catch (tableError) {
      console.error('\n❌ Error al verificar/crear la tabla:', tableError.message);
    }
    
    return true;
  } catch (error) {
    console.error('\n❌ Error al conectar a PostgreSQL:', error.message);
    
    console.log('\nSugerencias para solucionar el problema:');
    
    if (error.message.includes('does not exist')) {
      console.log(`1. La base de datos "${config.database}" no existe. Intenta crear la base de datos:`);
      console.log(`   docker exec -it 7f2cf355930d psql -U ${config.user} -c "CREATE DATABASE ${config.database}"`);
      
      // Intentar conectarse a postgres (base de datos por defecto)
      console.log('\nIntentando conectar a la base de datos "postgres" (predeterminada)...');
      
      try {
        const pgClient = new Client({
          ...config,
          database: 'postgres',
          connectionTimeoutMillis: 5000
        });
        
        await pgClient.connect();
        console.log('✅ Conexión exitosa a la base de datos "postgres"!');
        
        // Intentar crear la base de datos que queríamos originalmente
        try {
          await pgClient.query(`CREATE DATABASE ${config.database}`);
          console.log(`✅ Base de datos "${config.database}" creada correctamente`);
          console.log('Intenta ejecutar este script nuevamente para continuar con la configuración');
        } catch (createDbError) {
          console.error(`❌ Error al crear la base de datos: ${createDbError.message}`);
        }
        
        await pgClient.end();
      } catch (pgError) {
        console.error(`❌ Error al conectar a "postgres": ${pgError.message}`);
      }
    } else if (error.message.includes('password authentication failed')) {
      console.log('1. La contraseña proporcionada es incorrecta');
      console.log('2. Verifica las variables de entorno del contenedor para encontrar la contraseña correcta:');
      console.log('   docker inspect 7f2cf355930d | grep POSTGRES_PASSWORD');
    } else if (error.message.includes('Connection refused')) {
      console.log('1. Verifica que el contenedor esté ejecutándose: docker ps');
      console.log('2. Asegúrate de que el puerto 5432 esté expuesto correctamente:');
      console.log('   docker port 7f2cf355930d');
    }
    
    return false;
  } finally {
    try {
      await client.end();
    } catch (e) {
      // Ignorar errores al cerrar el cliente
    }
  }
}

// Ejecutar la verificación
verifyConnection()
  .then(success => {
    if (success) {
      console.log('\n✅ Verificación completada con éxito');
      console.log('Ahora puedes ejecutar el backend y la aplicación Angular');
    } else {
      console.log('\n❌ Verificación fallida. Sigue las sugerencias anteriores para resolver el problema');
    }
  })
  .catch(error => {
    console.error('Error no controlado:', error);
  })
  .finally(() => {
    process.exit();
  });
