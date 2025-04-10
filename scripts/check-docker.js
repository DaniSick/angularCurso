const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Funciones para comprobar Docker
async function checkDockerInstallation() {
  console.log('Verificando instalación de Docker...');
  
  try {
    // Intentar ejecutar docker --version
    const { stdout } = await execPromise('docker --version');
    console.log('✅ Docker está instalado:');
    console.log(stdout.trim());
    return true;
  } catch (error) {
    console.error('❌ Error al verificar Docker:');
    console.error(error.message);
    
    console.log('\nSoluciones posibles para WSL:');
    console.log('1. Asegúrate de que Docker Desktop esté instalado y en ejecución en Windows');
    console.log('2. Verifica que la integración con WSL esté habilitada en Docker Desktop');
    console.log('3. Intenta usar Docker directamente desde PowerShell o CMD en Windows');
    console.log('4. Alternativa: puedes instalar Docker directamente en WSL2 (no recomendado si ya tienes Docker Desktop)');
    
    return false;
  }
}

async function checkDockerRunning() {
  console.log('\nVerificando si Docker está en ejecución...');
  
  try {
    await execPromise('docker info');
    console.log('✅ El servicio Docker está en ejecución');
    return true;
  } catch (error) {
    console.error('❌ El servicio Docker no está en ejecución o hay problemas de conexión');
    console.error(error.message);
    
    console.log('\nSoluciones posibles:');
    console.log('1. Inicia Docker Desktop desde Windows');
    console.log('2. Reinicia tu ordenador');
    console.log('3. Verifica que el servicio Docker esté en ejecución en Windows');
    
    return false;
  }
}

async function listDockerContainers() {
  console.log('\nListando contenedores Docker...');
  
  try {
    const { stdout } = await execPromise('docker ps -a');
    console.log('Contenedores Docker:');
    console.log(stdout);
    return stdout;
  } catch (error) {
    console.error('❌ Error al listar contenedores Docker:');
    console.error(error.message);
    return null;
  }
}

async function checkDatabaseContainer() {
  console.log('\nBuscando contenedores de base de datos...');
  
  try {
    // Buscar contenedores que podrían ser bases de datos
    const { stdout } = await execPromise('docker ps -a | grep -E "mysql|postgres|mariadb|mongo|database|db"');
    
    if (stdout.trim()) {
      console.log('✅ Se encontraron posibles contenedores de base de datos:');
      console.log(stdout);
      
      // Extraer IDs de contenedores
      const containerIds = stdout.split('\n')
                             .filter(line => line.trim())
                             .map(line => line.split(' ')[0]);
      
      // Verificar el estado de cada contenedor
      for (const id of containerIds) {
        await checkContainerStatus(id);
      }
      
      return true;
    } else {
      console.log('⚠️ No se encontraron contenedores de base de datos');
      return false;
    }
  } catch (error) {
    // grep devuelve código de salida 1 si no encuentra coincidencias
    if (error.code === 1) {
      console.log('⚠️ No se encontraron contenedores de base de datos');
    } else {
      console.error('❌ Error al buscar contenedores de base de datos:');
      console.error(error.message);
    }
    return false;
  }
}

async function checkContainerStatus(containerId) {
  try {
    // Obtener detalles del contenedor
    const { stdout } = await execPromise(`docker inspect --format='{{.State.Status}} - {{.Name}} - {{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' ${containerId}`);
    console.log(`Contenedor ${containerId}: ${stdout}`);
    
    // Si el contenedor no está en ejecución, mostrar recomendación
    if (!stdout.startsWith('running')) {
      console.log(`⚠️ El contenedor ${containerId} no está en ejecución. Para iniciarlo, ejecuta:`);
      console.log(`docker start ${containerId}`);
    }
  } catch (error) {
    console.error(`❌ Error al verificar estado del contenedor ${containerId}:`);
    console.error(error.message);
  }
}

async function checkDatabaseConnection() {
  console.log('\nVerificando conexión a la base de datos...');
  
  try {
    // Intenta importar los módulos necesarios para la base de datos
    const sequelize = require('../config/database');
    
    try {
      await sequelize.authenticate();
      console.log('✅ Conexión a la base de datos establecida correctamente');
      
      // Verificar tablas en la base de datos
      try {
        const [results] = await sequelize.query('SHOW TABLES');
        console.log('Tablas en la base de datos:');
        console.log(results);
      } catch (queryError) {
        console.error('❌ Error al consultar tablas:', queryError.message);
      }
      
      return true;
    } catch (authError) {
      console.error('❌ Error al conectar con la base de datos:');
      console.error(authError.message);
      
      console.log('\nSugerencias:');
      console.log('1. Verifica que el contenedor de la base de datos esté en ejecución');
      console.log('2. Comprueba que la configuración de conexión sea correcta en config/database.js');
      console.log('3. Asegúrate de que la base de datos esté accesible desde WSL');
      
      return false;
    } finally {
      // Cerrar la conexión
      try {
        await sequelize.close();
      } catch (error) {
        // Ignorar errores al cerrar
      }
    }
  } catch (moduleError) {
    console.error('❌ Error al cargar módulos de base de datos:');
    console.error(moduleError.message);
    
    console.log('\nSugerencias:');
    console.log('1. Asegúrate de que las dependencias estén instaladas: npm install');
    console.log('2. Verifica la estructura del proyecto y la configuración de la base de datos');
    
    return false;
  }
}

// Ejecutar todas las verificaciones
async function runAllChecks() {
  console.log('=== DIAGNÓSTICO DE DOCKER Y BASE DE DATOS ===\n');
  
  const dockerInstalled = await checkDockerInstallation();
  if (!dockerInstalled) {
    console.log('\n⚠️ No se pudo verificar la instalación de Docker. No podemos continuar con más verificaciones.');
    showManualVerificationInstructions();
    return;
  }
  
  const dockerRunning = await checkDockerRunning();
  if (!dockerRunning) {
    console.log('\n⚠️ Docker no está en ejecución. Inicia Docker y vuelve a ejecutar este script.');
    showManualVerificationInstructions();
    return;
  }
  
  await listDockerContainers();
  const dbContainerFound = await checkDatabaseContainer();
  
  if (!dbContainerFound) {
    console.log('\n⚠️ No se encontraron contenedores de base de datos. Verifica manualmente o inicia tu contenedor.');
    showManualVerificationInstructions();
  }
  
  await checkDatabaseConnection();
  
  console.log('\n=== DIAGNÓSTICO COMPLETADO ===');
}

function showManualVerificationInstructions() {
  console.log('\n=== INSTRUCCIONES PARA VERIFICACIÓN MANUAL ===');
  console.log('Si estás usando WSL con Docker Desktop en Windows:');
  console.log('1. Abre PowerShell o CMD en Windows');
  console.log('2. Ejecuta los siguientes comandos:');
  console.log('   - docker --version (Verificar instalación)');
  console.log('   - docker ps -a (Listar todos los contenedores)');
  console.log('   - docker start NOMBRE_CONTENEDOR (Iniciar un contenedor específico)');
  console.log('\nSi quieres usar Docker directamente en WSL:');
  console.log('1. Instala Docker en WSL: https://docs.docker.com/engine/install/ubuntu/');
  console.log('2. Inicia el servicio: sudo service docker start');
}

// Ejecutar el script
runAllChecks().catch(error => {
  console.error('Error inesperado durante la verificación:');
  console.error(error);
});
