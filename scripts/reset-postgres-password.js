const { spawn } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('=== RESETEAR CONTRASEÑA DE POSTGRES ===');
console.log('Este script te ayudará a establecer una nueva contraseña para el usuario postgres');
console.log('en el contenedor Docker de PostgreSQL.\n');

// ID del contenedor PostgreSQL
const containerId = '7f2cf355930d';

async function resetPostgresPassword() {
  return new Promise((resolve) => {
    rl.question('Ingresa la nueva contraseña para el usuario postgres: ', async (password) => {
      if (!password) {
        console.log('❌ La contraseña no puede estar vacía. Inténtalo de nuevo.');
        rl.close();
        resolve(false);
        return;
      }
      
      console.log(`\nIntentando establecer la contraseña "${password}" para el usuario postgres...`);
      
      try {
        // Comando SQL para cambiar la contraseña
        const sqlCommand = `ALTER USER postgres WITH PASSWORD '${password}';`;
        
        // Crear el comando completo para ejecutar dentro del contenedor
        const dockerExecCommand = [
          'exec',
          '-i',
          containerId,
          'psql',
          '-U',
          'postgres',
          '-c',
          sqlCommand
        ];
        
        console.log('Ejecutando comando en el contenedor Docker...');
        
        const dockerProcess = spawn('docker', dockerExecCommand);
        
        // Capturar salida estándar
        dockerProcess.stdout.on('data', (data) => {
          console.log(`Resultado: ${data}`);
        });
        
        // Capturar errores
        dockerProcess.stderr.on('data', (data) => {
          console.error(`Error: ${data}`);
        });
        
        // Manejar finalización del proceso
        dockerProcess.on('close', (code) => {
          if (code === 0) {
            console.log('✅ Contraseña cambiada exitosamente!');
            
            // Crear archivo de configuración con la nueva contraseña
            const fs = require('fs');
            const configDir = __dirname + '/../config';
            
            if (!fs.existsSync(configDir)) {
              fs.mkdirSync(configDir, { recursive: true });
            }
            
            fs.writeFileSync(
              `${configDir}/db-config.json`,
              JSON.stringify({
                host: 'localhost',
                port: 5432,
                database: 'postgres',
                user: 'postgres',
                password: password
              }, null, 2)
            );
            
            console.log('\nLa configuración ha sido guardada en config/db-config.json');
            console.log('Ahora puedes ejecutar npm run db:check para verificar la conexión');
            resolve(true);
          } else {
            console.error(`❌ Error al cambiar la contraseña. Código de salida: ${code}`);
            console.log('Puedes intentar conectarte directamente al contenedor con:');
            console.log(`docker exec -it ${containerId} bash`);
            console.log('Y luego dentro del contenedor:');
            console.log('psql -U postgres');
            console.log(`ALTER USER postgres WITH PASSWORD 'nueva_contraseña';`);
            resolve(false);
          }
        });
      } catch (error) {
        console.error('❌ Error al ejecutar el comando Docker:', error.message);
        resolve(false);
      }
      
      rl.close();
    });
  });
}

resetPostgresPassword()
  .then(success => {
    if (success) {
      console.log('\n¡Proceso completado! Ahora puedes continuar con tus scripts.');
    } else {
      console.log('\nEl proceso no se completó correctamente. Revisa los mensajes anteriores.');
    }
  })
  .catch(error => {
    console.error('Error no controlado:', error);
  })
  .finally(() => {
    process.exit();
  });
