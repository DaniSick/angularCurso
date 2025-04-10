const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('=== INICIALIZACIÓN DEL PROYECTO ===');

// Comprobar si hay comandos necesarios
const dependencies = [
  { name: 'express', dev: false },
  { name: 'cors', dev: false },
  { name: 'pg', dev: false },
  { name: 'sequelize', dev: false }
];

// Instalar dependencias
function installDependencies() {
  return new Promise((resolve, reject) => {
    console.log('Verificando e instalando dependencias necesarias...');
    
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    let packageJson;
    
    try {
      packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    } catch (error) {
      return reject(new Error(`No se pudo leer package.json: ${error.message}`));
    }
    
    const missingDeps = [];
    
    dependencies.forEach(dep => {
      const depSet = dep.dev ? packageJson.devDependencies : packageJson.dependencies;
      if (!depSet || !depSet[dep.name]) {
        missingDeps.push(dep.name);
      }
    });
    
    if (missingDeps.length > 0) {
      console.log(`Instalando dependencias faltantes: ${missingDeps.join(', ')}`);
      
      const npmInstall = spawn('npm', ['install', '--save', ...missingDeps], {
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
      });
      
      npmInstall.on('close', code => {
        if (code === 0) {
          console.log('✅ Dependencias instaladas correctamente');
          resolve();
        } else {
          reject(new Error(`Error al instalar dependencias. Código: ${code}`));
        }
      });
    } else {
      console.log('✅ Todas las dependencias ya están instaladas');
      resolve();
    }
  });
}

// Iniciar el contenedor PostgreSQL
function startPostgresContainer() {
  return new Promise((resolve, reject) => {
    console.log('\nIniciando contenedor PostgreSQL...');
    
    exec('docker start 7f2cf355930d', (error, stdout, stderr) => {
      if (error) {
        console.error('Error al iniciar el contenedor PostgreSQL:', error.message);
        console.log('Intentando continuar de todos modos...');
      } else {
        console.log('✅ Contenedor PostgreSQL iniciado:', stdout.trim());
      }
      
      // Dar tiempo a que PostgreSQL inicie completamente
      console.log('Esperando a que PostgreSQL esté listo...');
      setTimeout(resolve, 3000);
    });
  });
}

// Sincronizar la base de datos
function syncDatabase() {
  return new Promise((resolve, reject) => {
    console.log('\nSincronizando la base de datos...');
    
    const syncProcess = spawn('node', ['scripts/syncDatabase.js'], {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    
    syncProcess.on('close', code => {
      if (code === 0) {
        console.log('✅ Base de datos sincronizada correctamente');
        resolve();
      } else {
        console.error(`⚠️ Error al sincronizar la base de datos. Código: ${code}`);
        console.log('Continuando de todos modos...');
        resolve();
      }
    });
  });
}

// Sembrar la base de datos
function seedDatabase() {
  return new Promise((resolve, reject) => {
    console.log('\nVerificando si hay datos en la base de datos...');
    
    const checkScript = path.join(__dirname, 'check-postgres-tables.js');
    
    // Si no existe el script, lo creamos
    if (!fs.existsSync(checkScript)) {
      console.log('Script de verificación no encontrado, saltando verificación...');
      runSeed();
      return;
    }
    
    exec(`node ${checkScript}`, (error, stdout, stderr) => {
      if (stdout.includes('Número de registros: 0') || 
          stdout.includes('La tabla está vacía') ||
          stdout.includes('No se encontró ninguna tabla de usuarios') ||
          stdout.includes('No hay tablas')) {
        console.log('Base de datos vacía, ejecutando seed...');
        runSeed();
      } else if (error) {
        console.error('Error al verificar la base de datos:', error.message);
        console.log('Ejecutando seed por precaución...');
        runSeed();
      } else {
        console.log('✅ La base de datos ya contiene datos, saltando seed');
        resolve();
      }
    });
    
    function runSeed() {
      const seedProcess = spawn('node', ['scripts/seedDatabase.js'], {
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
      });
      
      seedProcess.on('close', code => {
        if (code === 0) {
          console.log('✅ Datos sembrados correctamente en la base de datos');
          resolve();
        } else {
          console.error(`⚠️ Error al sembrar la base de datos. Código: ${code}`);
          console.log('Continuando de todos modos...');
          resolve();
        }
      });
    }
  });
}

// Iniciar el servidor backend
function startBackend() {
  return new Promise((resolve, reject) => {
    console.log('\nIniciando servidor backend...');
    
    // Buscar el archivo del servidor
    const serverPaths = [
      path.join(__dirname, '..', 'backend', 'server.js'),
      path.join(__dirname, '..', 'server.js'),
      path.join(__dirname, '..', 'backend', 'index.js'),
      path.join(__dirname, '..', 'backend', 'app.js')
    ];
    
    let serverPath = null;
    for (const p of serverPaths) {
      if (fs.existsSync(p)) {
        serverPath = p;
        break;
      }
    }
    
    if (!serverPath) {
      console.error('❌ No se encontró el archivo del servidor backend');
      return reject(new Error('Archivo del servidor no encontrado'));
    }
    
    console.log(`Iniciando servidor desde: ${serverPath}`);
    
    const backendProcess = spawn('node', [serverPath], {
      stdio: 'inherit',
      detached: true
    });
    
    backendProcess.unref();
    console.log('✅ Servidor backend iniciado en segundo plano');
    
    // Esperar a que el servidor esté listo
    setTimeout(resolve, 2000);
  });
}

// Iniciar la aplicación Angular
function startAngular() {
  return new Promise((resolve, reject) => {
    console.log('\nIniciando aplicación Angular...');
    
    const angularProcess = spawn('ng', ['serve'], {
      stdio: 'inherit',
      shell: true,
      cwd: path.join(__dirname, '..')
    });
    
    angularProcess.on('close', code => {
      console.log(`Angular se ha detenido con código ${code}`);
      resolve();
    });
    
    // No hacemos resolve mientras Angular esté en ejecución
  });
}

// Ejecutar todo en secuencia
async function run() {
  try {
    await installDependencies();
    await startPostgresContainer();
    await syncDatabase();
    await seedDatabase();
    await startBackend();
    
    console.log('\n=== TODO INICIALIZADO CORRECTAMENTE ===');
    console.log('Backend: http://localhost:3000');
    console.log('Frontend: http://localhost:4200 (iniciando...)');
    console.log('\nPresiona Ctrl+C para detener la aplicación Angular');
    console.log('El servidor backend se ejecuta en segundo plano.');
    
    await startAngular();
  } catch (error) {
    console.error('\n❌ Error durante la inicialización:', error.message);
    process.exit(1);
  }
}

// Ejecutar la inicialización
run();
