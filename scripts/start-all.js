const { exec } = require('child_process');
const { spawn } = require('child_process');
const path = require('path');

console.log('=== INICIANDO APLICACIÓN COMPLETA ===');

// Paso 1: Verificar y arrancar el contenedor de PostgreSQL
console.log('\n1. Verificando contenedor PostgreSQL...');
exec('docker start 7f2cf355930d', (error, stdout, stderr) => {
  if (error) {
    console.error('Error al iniciar el contenedor PostgreSQL:', error);
    console.log('Intentando continuar de todos modos...');
  } else {
    console.log('Contenedor PostgreSQL iniciado:', stdout.trim());
  }
  
  // Paso 2: Iniciar el servidor backend
  console.log('\n2. Iniciando servidor backend...');
  const backendPath = path.join(__dirname, '..', 'backend');
  
  // Intenta primero con server.js en la raíz del proyecto
  let serverPath = path.join(__dirname, '..', 'server.js');
  
  // Si no existe, intenta con index.js en la carpeta backend
  if (!require('fs').existsSync(serverPath)) {
    serverPath = path.join(backendPath, 'index.js');
  }
  
  // Si tampoco existe, intenta con app.js en la carpeta backend
  if (!require('fs').existsSync(serverPath)) {
    serverPath = path.join(backendPath, 'app.js');
  }
  
  // Si no encontramos ninguno de los anteriores, usa server.js en la raíz como fallback
  const backendProcess = spawn('node', [serverPath], {
    stdio: 'inherit',
    detached: true
  });
  
  backendProcess.unref();
  
  // Esperar un poco para que el backend se inicie correctamente
  setTimeout(() => {
    // Paso 3: Iniciar la aplicación Angular
    console.log('\n3. Iniciando aplicación Angular...');
    const angularProcess = spawn('ng', ['serve'], {
      stdio: 'inherit',
      shell: true
    });
    
    console.log('\n=== APLICACIÓN INICIADA ===');
    console.log('Backend: http://localhost:3000');
    console.log('Frontend: http://localhost:4200');
    console.log('\nPresiona Ctrl+C para detener la aplicación Angular');
    console.log('El servidor backend se ejecuta en segundo plano. Para detenerlo, encuentra su PID y usa kill.');
    
    angularProcess.on('close', (code) => {
      console.log(`La aplicación Angular se ha detenido con código ${code}`);
    });
  }, 3000);
});
