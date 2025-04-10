const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ID del contenedor PostgreSQL
const containerId = '7f2cf355930d';

console.log('=== INSPECCIÓN DETALLADA DEL CONTENEDOR POSTGRESQL ===');
console.log(`Analizando contenedor Docker con ID: ${containerId}`);

// Función para ejecutar comandos en el contenedor
async function executeInContainer(command) {
  return new Promise((resolve, reject) => {
    const dockerProcess = spawn('docker', ['exec', '-i', containerId, 'bash', '-c', command]);
    
    let output = '';
    let errorOutput = '';
    
    dockerProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    dockerProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    dockerProcess.on('close', (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(`Comando falló con código ${code}: ${errorOutput}`));
      }
    });
  });
}

// Verificar si el contenedor está en ejecución
async function checkContainerRunning() {
  try {
    const output = execSync(`docker inspect --format='{{.State.Running}}' ${containerId}`).toString().trim();
    return output === 'true';
  } catch (error) {
    console.error(`Error al verificar estado del contenedor: ${error.message}`);
    return false;
  }
}

// Obtener información detallada del contenedor
async function getContainerInfo() {
  try {
    const output = execSync(`docker inspect ${containerId}`).toString();
    return JSON.parse(output)[0];
  } catch (error) {
    console.error(`Error al obtener información del contenedor: ${error.message}`);
    return null;
  }
}

// Encontrar usuarios PostgreSQL en el contenedor
async function findPostgresUsers() {
  try {
    // Intentar encontrar usuarios de PostgreSQL usando diferentes métodos
    
    console.log('\nBuscando usuarios PostgreSQL...');
    
    try {
      // Método 1: Ver roles en la base de datos
      const output1 = await executeInContainer('psql -c "\\du"');
      console.log('\n=== ROLES DE POSTGRESQL ===');
      console.log(output1);
      
      // Extraer nombres de usuarios de la salida
      const userLines = output1.split('\n')
        .filter(line => line.trim() && !line.includes('-') && !line.includes('Role name'))
        .map(line => line.trim().split('|')[0].trim());
      
      if (userLines.length > 0) {
        console.log('\nUsuarios encontrados:');
        userLines.forEach(user => console.log(`- ${user}`));
        return userLines;
      }
    } catch (error1) {
      console.log(`No se pudieron listar roles: ${error1.message}`);
    }
    
    try {
      // Método 2: Intentar detectar el usuario que ejecuta PostgreSQL
      const output2 = await executeInContainer('ps aux | grep postgres');
      console.log('\n=== PROCESOS POSTGRESQL ===');
      console.log(output2);
      
      // Buscar usuario en la salida del comando ps
      const processLines = output2.split('\n')
        .filter(line => line.includes('postgres') && !line.includes('grep'));
      
      if (processLines.length > 0) {
        const possibleUsers = new Set();
        processLines.forEach(line => {
          const parts = line.trim().split(/\s+/);
          if (parts.length > 0) {
            possibleUsers.add(parts[0]);
          }
        });
        
        console.log('\nPosibles usuarios del sistema que ejecutan PostgreSQL:');
        Array.from(possibleUsers).forEach(user => console.log(`- ${user}`));
      }
    } catch (error2) {
      console.log(`No se pudieron listar procesos: ${error2.message}`);
    }
    
    try {
      // Método 3: Buscar en archivos de configuración de PostgreSQL
      const output3 = await executeInContainer('cat /etc/passwd | grep -E "postgres|postgre"');
      console.log('\n=== USUARIOS DEL SISTEMA RELACIONADOS CON POSTGRESQL ===');
      console.log(output3 || 'No se encontraron usuarios relacionados con PostgreSQL');
    } catch (error3) {
      console.log('No se pudieron encontrar usuarios en /etc/passwd');
    }
    
    // Buscar archivos de configuración de PostgreSQL
    try {
      const configFiles = await executeInContainer('find / -name "postgresql.conf" 2>/dev/null || echo "No encontrado"');
      console.log('\n=== ARCHIVOS DE CONFIGURACIÓN ===');
      console.log(configFiles);
      
      // Si encontramos archivos de configuración, verificar el directorio de datos
      if (configFiles && !configFiles.includes('No encontrado')) {
        const configDirs = configFiles.split('\n')
          .filter(line => line.trim())
          .map(path => path.substring(0, path.lastIndexOf('/')));
        
        console.log('\nDirectorios de configuración encontrados:');
        configDirs.forEach(dir => console.log(`- ${dir}`));
      }
    } catch (error4) {
      console.log(`No se pudieron encontrar archivos de configuración: ${error4.message}`);
    }
    
    // Intentar obtener información de la base de datos
    try {
      // Intenta conectar con el usuario predeterminado de Docker para PostgreSQL
      const output5 = await executeInContainer('psql -U postgres -l');
      console.log('\n=== BASES DE DATOS ===');
      console.log(output5);
    } catch (error5) {
      console.log(`No se pudo listar bases de datos con usuario postgres: ${error5.message}`);
      
      // Intentar con nombre de usuario alternativo
      try {
        await executeInContainer('psql --version');
        console.log('\nPostgreSQL está instalado en el contenedor.');
        
        // Probar con diferentes nombres de usuario comunes para PostgreSQL
        const commonUsers = ['postgres', 'admin', 'root', 'postgre'];
        
        for (const user of commonUsers) {
          try {
            console.log(`\nIntentando conectar como usuario "${user}"...`);
            const output = await executeInContainer(`psql -U ${user} -l`);
            console.log('✅ Conexión exitosa!');
            console.log(output);
            return [user];
          } catch (e) {
            console.log(`❌ No se pudo conectar como "${user}": ${e.message}`);
          }
        }
      } catch (error6) {
        console.log(`Error al verificar versión de PostgreSQL: ${error6.message}`);
      }
    }
    
    return [];
  } catch (error) {
    console.error(`Error general al buscar usuarios: ${error.message}`);
    return [];
  }
}

// Probar la conexión y guardar la configuración
async function tryConnection(user, password) {
  try {
    console.log(`\nIntentando conectar a PostgreSQL con usuario "${user}" y contraseña "${password || '<vacía>'}"...`);
    
    // Primero con psql dentro del contenedor
    try {
      const command = password 
        ? `PGPASSWORD="${password}" psql -U ${user} -c "SELECT version()"`
        : `psql -U ${user} -c "SELECT version()"`;
      
      const output = await executeInContainer(command);
      console.log('✅ Conexión exitosa dentro del contenedor!');
      console.log(output);
      
      // Guardar la configuración
      saveConfig(user, password);
      return true;
    } catch (internalError) {
      console.log(`Error al conectar dentro del contenedor: ${internalError.message}`);
      return false;
    }
  } catch (error) {
    console.error(`Error general al probar la conexión: ${error.message}`);
    return false;
  }
}

// Guardar configuración de conexión
function saveConfig(user, password) {
  try {
    // Configuración para el archivo
    const config = {
      host: 'localhost',
      port: 5432,
      database: 'postgres', // Valor predeterminado, se podría personalizar
      user: user,
      password: password || ''
    };
    
    // Guardar configuración
    const configDir = path.join(__dirname, '..', 'config');
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(configDir, 'db-config.json'),
      JSON.stringify(config, null, 2)
    );
    
    console.log('\n✅ Configuración guardada en config/db-config.json');
    console.log('Usa esta configuración para conectarte:');
    console.log(config);
  } catch (error) {
    console.error(`Error al guardar configuración: ${error.message}`);
  }
}

// Ejecutar todos los análisis
async function runAnalysis() {
  // Verificar si el contenedor está en ejecución
  const isRunning = await checkContainerRunning();
  if (!isRunning) {
    console.log(`\nEl contenedor ${containerId} no está en ejecución. Intentando iniciarlo...`);
    try {
      execSync(`docker start ${containerId}`);
      console.log('✅ Contenedor iniciado.');
      
      // Esperar a que PostgreSQL inicialice
      console.log('Esperando 5 segundos para que PostgreSQL se inicialice...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    } catch (error) {
      console.error(`Error al iniciar el contenedor: ${error.message}`);
      return;
    }
  } else {
    console.log('✅ El contenedor está en ejecución.');
  }
  
  // Obtener información detallada del contenedor
  const containerInfo = await getContainerInfo();
  if (containerInfo) {
    console.log('\n=== INFORMACIÓN DEL CONTENEDOR ===');
    console.log(`Nombre: ${containerInfo.Name}`);
    console.log(`Imagen: ${containerInfo.Config.Image}`);
    console.log(`Comando: ${containerInfo.Config.Cmd}`);
    console.log(`Entrypoint: ${containerInfo.Config.Entrypoint}`);
    console.log(`Variables de entorno:`);
    containerInfo.Config.Env.forEach(env => console.log(`- ${env}`));
    
    // Intentar detectar el usuario de PostgreSQL a partir de variables de entorno
    const pgUserEnv = containerInfo.Config.Env.find(env => env.startsWith('POSTGRES_USER='));
    const pgPasswordEnv = containerInfo.Config.Env.find(env => env.startsWith('POSTGRES_PASSWORD='));
    
    let detectedUser = null;
    let detectedPassword = null;
    
    if (pgUserEnv) {
      detectedUser = pgUserEnv.split('=')[1];
      console.log(`\n✅ Usuario PostgreSQL detectado en variables de entorno: ${detectedUser}`);
    }
    
    if (pgPasswordEnv) {
      detectedPassword = pgPasswordEnv.split('=')[1];
      console.log('✅ Contraseña PostgreSQL detectada en variables de entorno');
    }
    
    // Si se detectó usuario y contraseña, probar la conexión
    if (detectedUser && detectedPassword) {
      await tryConnection(detectedUser, detectedPassword);
    } else {
      // Buscar usuarios de PostgreSQL
      const users = await findPostgresUsers();
      
      if (users && users.length > 0) {
        // Intentar conexión con los usuarios encontrados
        for (const user of users) {
          // Probar con contraseña vacía primero
          const connected = await tryConnection(user, '');
          
          if (!connected) {
            // Si no funciona, intentar con algunas contraseñas comunes
            const commonPasswords = ['postgres', 'admin', 'password', user, `${user}123`];
            for (const pwd of commonPasswords) {
              const pwdConnected = await tryConnection(user, pwd);
              if (pwdConnected) break;
            }
          }
        }
      } else {
        console.log('\n❌ No se pudieron detectar usuarios PostgreSQL en el contenedor.');
        console.log('\nRecomendaciones:');
        console.log('1. Conéctate manualmente al contenedor: docker exec -it 7f2cf355930d bash');
        console.log('2. Intenta identificar el usuario de PostgreSQL y cómo conectarte');
        console.log('3. Ajusta manualmente el archivo config/db-config.json con los datos correctos');
      }
    }
  }
}

// Ejecutar análisis
runAnalysis()
  .catch(error => {
    console.error('Error inesperado durante el análisis:', error);
  })
  .finally(() => {
    console.log('\n=== ANÁLISIS COMPLETADO ===');
  });
