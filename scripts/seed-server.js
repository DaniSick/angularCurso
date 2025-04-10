const axios = require('axios');

// Configuración
const API_URL = 'http://localhost:3000';
const NUM_USERS = 100; // Número de usuarios a crear

// Función para sembrar la base de datos
async function seedDatabase() {
  try {
    console.log(`Intentando sembrar la base de datos con ${NUM_USERS} usuarios...`);
    
    const response = await axios.post(`${API_URL}/seed`, {
      count: NUM_USERS
    });
    
    console.log('Respuesta del servidor:', response.data);
    console.log(`✅ Se han creado ${response.data.count || NUM_USERS} usuarios con éxito.`);
  } catch (error) {
    console.error('❌ Error al sembrar la base de datos:');
    
    if (error.response) {
      // Error de respuesta del servidor
      console.error(`Status: ${error.response.status}`);
      console.error('Datos:', error.response.data);
    } else if (error.request) {
      // Error de conexión
      console.error('No se pudo conectar al servidor. Verifica que el servidor esté en ejecución.');
    } else {
      // Otro tipo de error
      console.error('Error:', error.message);
    }
    
    console.log('\nSugerencias:');
    console.log('1. Asegúrate de que el servidor esté en ejecución en http://localhost:3000');
    console.log('2. Verifica que el endpoint /seed esté implementado en el servidor');
    console.log('3. Revisa los logs del servidor para ver si hay errores');
  }
}

// Ejecutar la función
seedDatabase();
