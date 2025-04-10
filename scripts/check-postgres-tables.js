const { Client } = require('pg');

// Configuración de la conexión a PostgreSQL
// Prueba con diferentes combinaciones comunes de contraseñas
async function checkPostgresConnection() {
  const possibleConfigs = [
    { password: 'postgres' },         // Contraseña por defecto
    { password: '' },                 // Sin contraseña
    { password: 'admin' },            // Otra contraseña común
    { password: 'root' },             // Otra contraseña común
    { password: 'password' }          // Otra contraseña común
  ];

  console.log('=== VERIFICACIÓN DE CONEXIÓN A POSTGRESQL ===');
  console.log('Intentando conectar a PostgreSQL con diferentes configuraciones...');

  let connected = false;
  let workingConfig = null;
  
  for (const passwordConfig of possibleConfigs) {
    const config = {
      host: 'localhost',
      port: 5432,
      database: 'postgres',
      user: 'postgres',
      ...passwordConfig,
      // Tiempo límite de conexión más corto para probar rápidamente
      connectionTimeoutMillis: 3000
    };

    console.log(`\nProbando con contraseña: "${passwordConfig.password || '<vacía>'}"`);
    
    const client = new Client(config);
    try {
      await client.connect();
      console.log('✅ Conexión exitosa con esta configuración!');
      connected = true;
      workingConfig = config;
      await client.end();
      break;
    } catch (error) {
      console.log(`❌ No se pudo conectar: ${error.message}`);
      try {
        await client.end();
      } catch (e) {
        // Ignorar errores al cerrar cliente que no se conectó
      }
    }
  }

  if (!connected) {
    console.error('\n❌ No se pudo conectar con ninguna de las contraseñas comunes.');
    console.log('\nPara encontrar la contraseña correcta, puedes:');
    console.log('1. Verificar la contraseña usada al crear el contenedor Docker');
    console.log('2. Ejecutar: docker exec -it 7f2cf355930d bash');
    console.log('3. Dentro del contenedor, ejecutar: psql -U postgres');
    console.log('4. Si no pide contraseña, prueba establecer una nueva con: ALTER USER postgres PASSWORD \'nueva_contraseña\';');
    console.log('5. Otra opción es revisar los logs del contenedor: docker logs 7f2cf355930d');
    return;
  }

  // Si llegamos aquí, tenemos una configuración que funciona
  console.log('\n=== USANDO CONFIGURACIÓN EXITOSA PARA VERIFICAR TABLAS ===');
  
  const client = new Client(workingConfig);
  try {
    await client.connect();
    
    // Listar bases de datos
    const dbResult = await client.query(`
      SELECT datname FROM pg_database 
      WHERE datistemplate = false
      ORDER BY datname
    `);
    
    console.log('\nBases de datos disponibles:');
    dbResult.rows.forEach(row => {
      console.log(`  - ${row.datname}`);
    });
    
    // Obtener lista de tablas en el esquema public
    const tableResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('\nTablas en el esquema public:');
    if (tableResult.rows.length === 0) {
      console.log('  ¡No hay tablas! Necesitas ejecutar el script de sincronización.');
    } else {
      tableResult.rows.forEach(row => {
        console.log(`  - ${row.table_name}`);
      });
    }
    
    // Buscar específicamente la tabla de usuarios
    const userTableRow = tableResult.rows.find(row => 
      row.table_name.toLowerCase().includes('user') || 
      row.table_name.toLowerCase() === 'users'
    );
    
    if (userTableRow) {
      const tableName = userTableRow.table_name;
      console.log(`\n✅ Encontrada tabla de usuarios: ${tableName}`);
      
      // Contar registros
      const countResult = await client.query(`SELECT COUNT(*) FROM ${tableName}`);
      const count = parseInt(countResult.rows[0].count);
      console.log(`\nNúmero de registros: ${count}`);
      
      if (count > 0) {
        const sampleResult = await client.query(`SELECT * FROM ${tableName} LIMIT 3`);
        console.log('\nMuestra de registros:');
        console.log(JSON.stringify(sampleResult.rows, null, 2));
      }
    }
    
    // Almacenar la configuración exitosa para uso futuro
    console.log('\n=== INFORMACIÓN IMPORTANTE ===');
    console.log('Se encontró la siguiente configuración exitosa para PostgreSQL:');
    console.log(`Host: ${workingConfig.host}`);
    console.log(`Puerto: ${workingConfig.port}`);
    console.log(`Usuario: ${workingConfig.user}`);
    console.log(`Contraseña: ${workingConfig.password}`);
    console.log(`Base de datos: ${workingConfig.database}`);
    console.log('\nGuarda estos datos para actualizar los demás archivos de configuración.');
    
    // Crear archivo con la configuración para facilitar su uso en otros archivos
    const fs = require('fs');
    const configPath = __dirname + '/../config';
    if (!fs.existsSync(configPath)) {
      fs.mkdirSync(configPath, { recursive: true });
    }
    
    fs.writeFileSync(
      `${configPath}/db-config.json`, 
      JSON.stringify({ 
        host: workingConfig.host,
        port: workingConfig.port,
        database: workingConfig.database,
        user: workingConfig.user,
        password: workingConfig.password
      }, null, 2)
    );
    
    console.log('\nLa configuración ha sido guardada en config/db-config.json');
    
  } catch (error) {
    console.error('\n❌ Error durante la verificación de tablas:', error.message);
  } finally {
    await client.end();
  }
}

checkPostgresConnection().catch(err => {
  console.error('Error no controlado:', err);
});
