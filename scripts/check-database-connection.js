const net = require('net');
const { execSync } = require('child_process');

// Configuración de la base de datos (ajustar según tu configuración)
const dbConfigs = [
  { type: 'MySQL/MariaDB', host: 'localhost', port: 3306 },
  { type: 'PostgreSQL', host: 'localhost', port: 5432 },
  { type: 'MongoDB', host: 'localhost', port: 27017 }
];

// Verificar conectividad a puertos de base de datos
function checkPort(host, port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    
    // Establecer timeout
    socket.setTimeout(2000);
    
    // Manejar conexión exitosa
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    
    // Manejar errores y timeouts
    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });
    
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    
    // Intentar conectar
    socket.connect(port, host);
  });
}

// Verificar todas las configuraciones de bases de datos comunes
async function checkAllDatabases() {
  console.log('=== VERIFICANDO CONEXIONES A BASES DE DATOS ===\n');
  
  let anyDbFound = false;
  
  for (const db of dbConfigs) {
    console.log(`Verificando ${db.type} en ${db.host}:${db.port}...`);
    const isAccessible = await checkPort(db.host, db.port);
    
    if (isAccessible) {
      console.log(`✅ ${db.type} está ACCESIBLE en ${db.host}:${db.port}`);
      anyDbFound = true;
    } else {
      console.log(`❌ ${db.type} NO es accesible en ${db.host}:${db.port}`);
    }
    console.log();
  }
  
  if (!anyDbFound) {
    console.log('⚠️ No se encontró ninguna base de datos accesible en los puertos estándar.');
    console.log('Verifica que tu contenedor de base de datos esté en ejecución y mapeando puertos correctamente.');
  }
  
  // Verificar procesos de red activos
  try {
    console.log('\n=== PUERTOS DE RED ACTIVOS ===');
    const netstat = execSync('netstat -tuln').toString();
    console.log(netstat);
  } catch (error) {
    console.log('No se pudo obtener información sobre puertos activos:', error.message);
  }
  
  return anyDbFound;
}

// Comprobar configuración de base de datos
function checkDatabaseConfig() {
  console.log('\n=== VERIFICANDO ARCHIVO DE CONFIGURACIÓN DE BASE DE DATOS ===');
  
  try {
    const configPath = '../config/database.js';
    let dbConfig;
    
    try {
      dbConfig = require(configPath);
      console.log('✅ Archivo de configuración encontrado');
    } catch (error) {
      console.error(`❌ No se pudo cargar la configuración desde ${configPath}`);
      console.error(error.message);
      return null;
    }
    
    console.log('\nConfiguración actual:');
    
    if (typeof dbConfig === 'object') {
      // Mostrar información de conexión (ocultar contraseñas)
      const safeConfig = { ...dbConfig };
      if (safeConfig.password) safeConfig.password = '********';
      
      console.log(JSON.stringify(safeConfig, null, 2));
      
      // Verificar propiedades esenciales
      const requiredProps = ['host', 'port', 'database'];
      const missingProps = requiredProps.filter(prop => !dbConfig[prop]);
      
      if (missingProps.length > 0) {
        console.log(`⚠️ Propiedades faltantes en la configuración: ${missingProps.join(', ')}`);
      }
      
      return dbConfig;
    } else if (typeof dbConfig.getConnectionString === 'function') {
      // Si es un objeto con método getConnectionString
      console.log('La configuración parece ser un objeto con método getConnectionString()');
      return dbConfig;
    } else {
      console.log('⚠️ Formato de configuración desconocido');
      return null;
    }
  } catch (error) {
    console.error('❌ Error al verificar la configuración de la base de datos:');
    console.error(error);
    return null;
  }
}

// Función principal
async function main() {
  const dbAccessible = await checkAllDatabases();
  const dbConfig = checkDatabaseConfig();
  
  console.log('\n=== RESUMEN ===');
  
  if (dbAccessible) {
    console.log('✅ Se encontró al menos una base de datos accesible');
  } else {
    console.log('❌ No se encontró ninguna base de datos accesible');
  }
  
  if (dbConfig) {
    console.log('✅ Se encontró configuración de base de datos');
  } else {
    console.log('❌ No se encontró configuración de base de datos válida');
  }
  
  console.log('\n=== RECOMENDACIONES ===');
  
  if (!dbAccessible) {
    console.log('1. Verifica que Docker Desktop esté en ejecución en Windows');
    console.log('2. Asegúrate de que la integración con WSL esté habilitada en Docker Desktop');
    console.log('3. Verifica que el contenedor de base de datos esté iniciado');
    console.log('4. Comprueba que los puertos estén mapeados correctamente');
  }
  
  if (!dbConfig) {
    console.log('1. Verifica que el archivo config/database.js exista y tenga el formato correcto');
    console.log('2. Asegúrate de que la configuración tenga los parámetros host, port y database');
  }
  
  if (dbAccessible && dbConfig) {
    console.log('✅ Todo parece estar configurado correctamente. Deberías poder conectarte a la base de datos.');
    console.log('   Si sigues teniendo problemas, verifica los logs del servidor para más detalles.');
  }
}

main().catch(error => {
  console.error('Error durante la verificación:');
  console.error(error);
});
