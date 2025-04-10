const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('=== CONFIGURACIÓN MANUAL DE CONEXIÓN A POSTGRESQL ===');
console.log('Este script te ayudará a configurar manualmente la conexión a PostgreSQL');

async function promptUser(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function createConfig() {
  console.log('\nIntroduce los datos de conexión:');
  
  const host = await promptUser('Host [localhost]: ');
  const port = await promptUser('Puerto [5432]: ');
  const database = await promptUser('Base de datos [postgres]: ');
  const user = await promptUser('Usuario: ');
  const password = await promptUser('Contraseña: ');
  
  // Crear configuración
  const config = {
    host: host || 'localhost',
    port: parseInt(port || '5432'),
    database: database || 'postgres',
    user: user,
    password: password
  };
  
  if (!config.user) {
    console.log('\n❌ El usuario no puede estar vacío.');
    return false;
  }
  
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
  return true;
}

// Ejecutar el script
createConfig()
  .then(success => {
    if (success) {
      console.log('\nAhora puedes verificar la conexión con: npm run db:basic-check');
    } else {
      console.log('\nNo se pudo crear la configuración. Inténtalo nuevamente.');
    }
  })
  .catch(error => {
    console.error('Error durante la configuración:', error);
  })
  .finally(() => {
    rl.close();
  });
