const axios = require('axios');

// URL base de la API
const API_URL = 'http://localhost:3000';

// Función para probar los endpoints
async function testEndpoint(endpoint) {
  console.log(`\nProbando ${API_URL}${endpoint}...`);
  try {
    const response = await axios.get(`${API_URL}${endpoint}`);
    
    console.log('Estado de la respuesta:', response.status);
    console.log('Encabezados:', response.headers);
    
    // Verificar el tipo de respuesta
    console.log('Tipo de datos:', typeof response.data);
    console.log('¿Es array?', Array.isArray(response.data));
    
    if (Array.isArray(response.data)) {
      console.log('Cantidad de registros:', response.data.length);
      
      if (response.data.length > 0) {
        console.log('Muestra del primer registro:');
        console.log(JSON.stringify(response.data[0], null, 2));
      } else {
        console.log('No hay registros en la respuesta.');
      }
    } else if (typeof response.data === 'object' && response.data !== null) {
      // Si la respuesta es un objeto (posiblemente paginado)
      if (response.data.users && Array.isArray(response.data.users)) {
        console.log('Respuesta paginada. Cantidad de registros:', response.data.users.length);
        console.log('Total registros:', response.data.total || 'No especificado');
        
        if (response.data.users.length > 0) {
          console.log('Muestra del primer registro:');
          console.log(JSON.stringify(response.data.users[0], null, 2));
        }
      } else {
        console.log('Estructura de la respuesta:');
        console.log(JSON.stringify(response.data, null, 2));
      }
    } else {
      console.log('Contenido de la respuesta:');
      console.log(response.data);
    }
  } catch (error) {
    console.error('Error al realizar la solicitud:');
    
    if (error.response) {
      // Error con respuesta del servidor
      console.error(`Código de estado: ${error.response.status}`);
      console.error('Datos de error:', error.response.data);
    } else if (error.request) {
      // Error sin respuesta del servidor
      console.error('No se recibió respuesta del servidor. Verifica que el servidor esté en ejecución.');
    } else {
      // Otro tipo de error
      console.error('Error:', error.message);
    }
  }
}

// Ejecutar pruebas
async function runTests() {
  // Probar el endpoint principal de usuarios
  await testEndpoint('/users');
  
  // Probar posibles variantes
  await testEndpoint('/users/list');
  await testEndpoint('/api/users');
  
  // Probar endpoint de estado
  await testEndpoint('/health');
}

// Ejecutar todas las pruebas
runTests();
