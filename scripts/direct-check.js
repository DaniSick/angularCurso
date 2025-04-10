const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

console.log('=== VERIFICACIÓN DIRECTA DE POSTGRESQL ===');

// Configuración inicial
const possiblePasswords = ['postgres', '', 'admin', 'password'];
let connectedClient = null;
let workingConfig = null;

async function checkConnection() {
  console.log('Probando conexión a PostgreSQL con diferentes contraseñas...');
  
  for (const password of possiblePasswords) {
    const config = {
      host: 'localhost',
      port: 5432,
      database: 'postgres',
      user: 'postgres',
      password: password,
      connectionTimeoutMillis: 3000
    };
    
    console.log(`\nIntentando con contraseña: "${password || '<vacía>'}"`);
    
    const client = new Client(config);
    try {
      await client.connect();
      console.log('✅ Conexión exitosa!');
      workingConfig = { ...config };
      connectedClient = client;
      return true;
    } catch (error) {
      console.log(`❌ No se pudo conectar: ${error.message}`);
      try {
        await client.end();
      } catch (e) { /* ignorar errores al cerrar */ }
    }
  }
  
  console.log('❌ No se pudo conectar con ninguna de las contraseñas comunes.');
  return false;
}

async function checkTables() {
  if (!connectedClient) {
    console.log('No hay conexión disponible para verificar tablas.');
    return;
  }
  
  try {
    console.log('\n=== VERIFICANDO TABLAS DISPONIBLES ===');
    
    // Obtener lista de tablas
    const result = await connectedClient.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    if (result.rows.length === 0) {
      console.log('No hay tablas en el esquema public.');
      console.log('Ejecuta: node scripts/syncDatabase.js para crear tablas.');
    } else {
      console.log('Tablas disponibles:');
      result.rows.forEach(row => {
        console.log(`  - ${row.table_name}`);
      });
      
      // Verificar tabla de usuarios
      const userTable = result.rows.find(row => 
        row.table_name.toLowerCase().includes('user')
      );
      
      if (userTable) {
        const tableName = userTable.table_name;
        console.log(`\n✅ Tabla de usuarios encontrada: ${tableName}`);
        
        // Contar registros
        const countResult = await connectedClient.query(`SELECT COUNT(*) FROM ${tableName}`);
        console.log(`Número de registros: ${countResult.rows[0].count}`);
        
        if (parseInt(countResult.rows[0].count) > 0) {
          const sampleResult = await connectedClient.query(`SELECT * FROM ${tableName} LIMIT 2`);
          console.log('Muestra de datos:');
          console.log(JSON.stringify(sampleResult.rows, null, 2));
        } else {
          console.log('La tabla está vacía. Ejecuta: node scripts/seedDatabase.js');
        }
      }
    }
    
  } catch (error) {
    console.error('Error al verificar tablas:', error.message);
  }
}

async function saveConfig() {
  if (!workingConfig) return;
  
  try {
    // Guardar configuración para uso futuro
    const configDir = path.join(__dirname, '..', 'config');
    
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(configDir, 'db-config.json'),
      JSON.stringify(workingConfig, null, 2)
    );
    
    console.log('\nConfiguración guardada en config/db-config.json');
    console.log('Utiliza estos datos para configurar la conexión:');
    console.log(workingConfig);
  } catch (error) {
    console.error('Error al guardar configuración:', error.message);
  }
}

async function main() {
  const connected = await checkConnection();
  
  if (connected) {
    await checkTables();
    await saveConfig();
  } else {
    console.log('\n=== SUGERENCIAS PARA SOLUCIONAR PROBLEMAS ===');
    console.log('1. Verifica que el contenedor Docker esté en ejecución:');
    console.log('   docker start 7f2cf355930d');
    console.log('2. Intenta establecer una nueva contraseña:');
    console.log('   node scripts/reset-postgres-password.js');
  }
  
  // Cerrar conexión
  if (connectedClient) {
    await connectedClient.end();
  }
}

main().catch(error => {
  console.error('Error no controlado:', error);
}).finally(() => {
  console.log('\n=== VERIFICACIÓN FINALIZADA ===');
});
