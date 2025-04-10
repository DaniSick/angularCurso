const { spawn, execSync } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// ID del contenedor PostgreSQL
const containerId = '7f2cf355930d';

console.log('=== RESETEAR CONTRASEÑA DE POSTGRES (MÉTODO DIRECTO) ===');
console.log('Este script intenta restablecer la contraseña de postgres directamente');

async function checkContainerIsRunning() {
  try {
    const output = execSync(`docker inspect --format='{{.State.Running}}' ${containerId}`).toString().trim();
    return output === 'true';
  } catch (error) {
    return false;
  }
}

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

async function resetPasswordDirectly() {
  try {
    // Verificar si el contenedor está en ejecución
    const isRunning = await checkContainerIsRunning();
    if (!isRunning) {
      console.log(`El contenedor ${containerId} no está en ejecución, intentando iniciarlo...`);
      execSync(`docker start ${containerId}`);
      console.log('Contenedor iniciado, esperando 3 segundos para que PostgreSQL se inicialice...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    // Intento 1: Método con psql como postgres sin contraseña
    try {
      console.log('\nIntento 1: Ejecutando psql directamente como postgres...');
      const resetCommand1 = "psql -U postgres -c \"ALTER USER postgres WITH PASSWORD 'postgres123';\"";
      const result1 = await executeInContainer(resetCommand1);
      console.log('✅ Contraseña cambiada exitosamente a "postgres123"');
      saveConfig('postgres123');
      return true;
    } catch (error1) {
      console.log(`❌ Método 1 falló: ${error1.message}`);
      
      // Intento 2: Usando el usuario postgres del sistema operativo
      try {
        console.log('\nIntento 2: Usando el usuario postgres del sistema...');
        const resetCommand2 = "su - postgres -c \"psql -c \\\"ALTER USER postgres WITH PASSWORD 'postgres123';\\\"\"";
        const result2 = await executeInContainer(resetCommand2);
        console.log('✅ Contraseña cambiada exitosamente a "postgres123"');
        saveConfig('postgres123');
        return true;
      } catch (error2) {
        console.log(`❌ Método 2 falló: ${error2.message}`);
        
        // Intento 3: Reiniciando PostgreSQL con método alternativo
        try {
          console.log('\nIntento 3: Reiniciando PostgreSQL en modo especial...');
          console.log('Este paso puede tardar un momento...');
          
          // Detener PostgreSQL
          await executeInContainer("su - postgres -c \"/usr/lib/postgresql/*/bin/pg_ctl stop -D /var/lib/postgresql/data -m fast\" || true");
          
          // Iniciar con autenticación desactivada (puede variar según la versión de PostgreSQL)
          await executeInContainer("su - postgres -c \"/usr/lib/postgresql/*/bin/postgres -D /var/lib/postgresql/data -c authentication_timeout=0 -c password_encryption=md5\" & sleep 5 && echo 'PostgreSQL iniciado en modo especial'");
          
          // Intentar cambiar la contraseña
          await executeInContainer("su - postgres -c \"psql -c \\\"ALTER USER postgres WITH PASSWORD 'postgres123';\\\"\"");
          
          // Reiniciar PostgreSQL normalmente
          await executeInContainer("pkill postgres && sleep 2 && su - postgres -c \"/usr/lib/postgresql/*/bin/pg_ctl start -D /var/lib/postgresql/data\" && sleep 3");
          
          console.log('✅ Contraseña cambiada exitosamente a "postgres123"');
          saveConfig('postgres123');
          return true;
        } catch (error3) {
          console.log(`❌ Método 3 falló: ${error3.message}`);
          
          // Último intento: Pedir al usuario una contraseña
          return await manualPasswordReset();
        }
      }
    }
  } catch (error) {
    console.error('Error general:', error.message);
    return await manualPasswordReset();
  }
}

async function manualPasswordReset() {
  return new Promise((resolve) => {
    console.log('\n\n=== INTENTO MANUAL ===');
    console.log('Intentaremos cambiar la contraseña interactivamente.');
    
    rl.question('Ingresa una nueva contraseña para el usuario postgres: ', async (password) => {
      if (!password) {
        console.log('❌ La contraseña no puede estar vacía.');
        rl.close();
        resolve(false);
        return;
      }
      
      try {
        console.log(`\nIntentando establecer la contraseña "${password}"...`);
        // Comando SQL con comillas escapadas correctamente
        const sqlCommand = `ALTER USER postgres WITH PASSWORD '${password}';`;
        const command = `psql -U postgres -c "${sqlCommand}"`;
        
        try {
          await executeInContainer(command);
          console.log('✅ Contraseña cambiada exitosamente!');
          saveConfig(password);
          resolve(true);
        } catch (error) {
          console.error(`❌ No se pudo cambiar la contraseña: ${error.message}`);
          console.log('\nSugerencia: intenta estos comandos manualmente en una terminal:');
          console.log(`1. docker exec -it ${containerId} bash`);
          console.log('2. psql -U postgres');
          console.log(`3. ALTER USER postgres WITH PASSWORD '${password}';`);
          console.log('4. \\q');
          resolve(false);
        }
      } catch (error) {
        console.error('Error al ejecutar el comando:', error.message);
        resolve(false);
      } finally {
        rl.close();
      }
    });
  });
}

function saveConfig(password) {
  try {
    const configDir = path.join(__dirname, '..', 'config');
    
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(configDir, 'db-config.json'),
      JSON.stringify({
        host: 'localhost',
        port: 5432,
        database: 'postgres',
        user: 'postgres',
        password: password
      }, null, 2)
    );
    
    console.log('\nLa configuración ha sido guardada en config/db-config.json');
    console.log('Prueba la conexión ejecutando: npm run db:check');
  } catch (error) {
    console.error('Error al guardar configuración:', error.message);
  }
}

// Iniciar el proceso
resetPasswordDirectly()
  .then(success => {
    if (success) {
      console.log('\n✅ Proceso completado exitosamente.');
    } else {
      console.log('\n❌ No se pudo restablecer la contraseña automáticamente.');
    }
  })
  .catch(error => {
    console.error('Error no controlado:', error);
  })
  .finally(() => {
    if (rl.close) rl.close();
    process.exit();
  });
