const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

console.log('=== VERIFICACIÓN BÁSICA DE POSTGRESQL ===');

function loadConfig() {
  // Intentar cargar el archivo de configuración
  const configPath = path.join(__dirname, '..', 'config', 'db-config.json');
  
  if (fs.existsSync(configPath)) {
    try {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (e) {
      console.log('Error al leer el archivo de configuración, usando valores predeterminados');
    }
  }
  
  return {
    host: 'localhost',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'postgres123' // Contraseña predeterminada del script directo
  };
}

async function checkDatabase() {
  const config = loadConfig();
  
  console.log('Intentando conectar a PostgreSQL con esta configuración:');
  console.log(`  Host: ${config.host}`);
  console.log(`  Puerto: ${config.port}`);
  console.log(`  Base de datos: ${config.database}`);
  console.log(`  Usuario: ${config.user}`);
  console.log(`  Contraseña: ${'*'.repeat(config.password ? config.password.length : 0)}`);
  
  const client = new Client({
    ...config,
    connectionTimeoutMillis: 5000
  });
  
  try {
    // Intentar conectar
    await client.connect();
    console.log('\n✅ Conexión exitosa a PostgreSQL!');
    
    // Verificar la versión
    const versionResult = await client.query('SELECT version()');
    console.log('\nInformación del servidor:');
    console.log(versionResult.rows[0].version);
    
    // Ver si hay tablas
    try {
      const tablesResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `);
      
      if (tablesResult.rows.length === 0) {
        console.log('\nNo hay tablas en la base de datos.');
        console.log('Ejecuta: npm run db:sync para crear las tablas necesarias');
      } else {
        console.log('\nTablas encontradas:');
        tablesResult.rows.forEach(row => {
          console.log(`  - ${row.table_name}`);
        });
        
        // Buscar la tabla de usuarios
        const userTable = tablesResult.rows.find(row => 
          row.table_name.toLowerCase().includes('user') || 
          row.table_name === 'users'
        );
        
        if (userTable) {
          console.log(`\n✅ Tabla de usuarios encontrada: ${userTable.table_name}`);
          
          // Contar registros
          const countResult = await client.query(`SELECT COUNT(*) FROM ${userTable.table_name}`);
          console.log(`Total de registros: ${countResult.rows[0].count}`);
          
          if (parseInt(countResult.rows[0].count) > 0) {
            // Mostrar algunos ejemplos
            const sampleResult = await client.query(`SELECT * FROM ${userTable.table_name} LIMIT 2`);
            console.log('\nEjemplos de registros:');
            console.log(JSON.stringify(sampleResult.rows, null, 2));
          } else {
            console.log('\nLa tabla está vacía. Ejecuta npm run db:seed para agregar datos.');
          }
        } else {
          console.log('\n⚠️ No se encontró tabla de usuarios.');
          console.log('Ejecuta: npm run db:sync para crear las tablas necesarias');
        }
      }
    } catch (tableError) {
      console.error('\nError al verificar tablas:', tableError.message);
    }
    
    return true;
  } catch (error) {
    console.error('\n❌ Error al conectar a PostgreSQL:', error.message);
    console.log('\nSugerencias:');
    console.log('1. Verifica que el contenedor de PostgreSQL esté en ejecución:');
    console.log('   docker start 7f2cf355930d');
    console.log('2. Usa el script para restablecer la contraseña:');
    console.log('   npm run db:reset-password-direct');
    
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
checkDatabase()
  .then(success => {
    if (success) {
      console.log('\n✅ Verificación completada con éxito.');
    } else {
      console.log('\n❌ Verificación fallida. Sigue las sugerencias anteriores.');
    }
  })
  .catch(error => {
    console.error('Error no controlado:', error);
  })
  .finally(() => {
    process.exit();
  });
