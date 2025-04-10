const { Client } = require('pg');

// Configuración de la conexión a PostgreSQL
const config = {
  host: 'localhost',
  port: 5432,
  database: 'postgres', // Base de datos predeterminada
  user: 'postgres',     // Usuario predeterminado
  password: 'postgres', // Contraseña predeterminada - ajusta según tu configuración
  // Si no conoces la contraseña, tendrás que verificarla
};

console.log('=== VERIFICACIÓN DE CONEXIÓN A POSTGRESQL ===');
console.log('Intentando conectar a PostgreSQL con la siguiente configuración:');
console.log(`  Host: ${config.host}`);
console.log(`  Puerto: ${config.port}`);
console.log(`  Base de datos: ${config.database}`);
console.log(`  Usuario: ${config.user}`);
console.log(`  Contraseña: ${'*'.repeat(config.password.length)}`);
console.log('\n');

async function checkPostgresConnection() {
  const client = new Client(config);
  
  try {
    // Intentar conectar
    await client.connect();
    console.log('✅ Conexión a PostgreSQL establecida correctamente');
    
    // Obtener información del servidor
    const versionResult = await client.query('SELECT version()');
    console.log('\nInformación del servidor PostgreSQL:');
    console.log(versionResult.rows[0].version);
    
    // Listar bases de datos
    const dbListResult = await client.query('SELECT datname FROM pg_database');
    console.log('\nBases de datos disponibles:');
    dbListResult.rows.forEach(row => {
      console.log(`  - ${row.datname}`);
    });
    
    // Verificar si existe la tabla de usuarios
    try {
      const tablesResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      
      console.log('\nTablas en la base de datos:');
      if (tablesResult.rows.length === 0) {
        console.log('  No hay tablas en el esquema público');
      } else {
        tablesResult.rows.forEach(row => {
          console.log(`  - ${row.table_name}`);
        });
      }
      
      // Buscar tabla de usuarios
      const userTable = tablesResult.rows.find(row => 
        row.table_name.toLowerCase().includes('user') || 
        row.table_name.toLowerCase().includes('usuario')
      );
      
      if (userTable) {
        console.log(`\n✅ Tabla de usuarios encontrada: ${userTable.table_name}`);
        
        // Mostrar estructura de la tabla
        const columnsResult = await client.query(`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = '${userTable.table_name}'
        `);
        
        console.log('\nEstructura de la tabla:');
        columnsResult.rows.forEach(row => {
          console.log(`  - ${row.column_name} (${row.data_type})`);
        });
        
        // Contar registros
        const countResult = await client.query(`SELECT COUNT(*) FROM ${userTable.table_name}`);
        console.log(`\nNúmero de registros: ${countResult.rows[0].count}`);
        
        // Mostrar muestra de datos
        if (parseInt(countResult.rows[0].count) > 0) {
          const sampleResult = await client.query(`SELECT * FROM ${userTable.table_name} LIMIT 3`);
          console.log('\nMuestra de datos:');
          console.log(JSON.stringify(sampleResult.rows, null, 2));
        }
      } else {
        console.log('\n❌ No se encontró ninguna tabla de usuarios');
        console.log('Sugerencia: Ejecuta el script de sincronización para crear la tabla de usuarios');
      }
      
    } catch (queryError) {
      console.error('\n❌ Error al consultar las tablas:', queryError.message);
    }
    
  } catch (error) {
    console.error('\n❌ Error al conectar a PostgreSQL:', error.message);
    console.log('\nPosibles soluciones:');
    console.log('1. Verifica que la contraseña y el usuario sean correctos');
    console.log('2. Asegúrate de que el contenedor PostgreSQL esté en ejecución (docker start 7f2cf355930d)');
    console.log('3. Verifica que el puerto 5432 esté correctamente mapeado y accesible');
    console.log('4. Si estás usando WSL, asegúrate de que puedes acceder a localhost desde WSL');
  } finally {
    await client.end();
  }
}

checkPostgresConnection().catch(error => {
  console.error('Error general:', error);
});
