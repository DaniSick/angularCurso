const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');

// Función para cargar la configuración de la base de datos
function loadDatabaseConfig() {
  // Valores predeterminados
  let config = {
    host: 'localhost',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'postgres123' // Contraseña que usamos en el script directo
  };

  // Ruta al archivo de configuración
  const dbConfigPath = path.join(__dirname, 'db-config.json');

  // Verifica si existe el archivo de configuración y lo carga
  if (fs.existsSync(dbConfigPath)) {
    try {
      const loadedConfig = JSON.parse(fs.readFileSync(dbConfigPath, 'utf8'));
      config = { ...config, ...loadedConfig };
      console.log('Configuración cargada desde db-config.json');
    } catch (error) {
      console.error('Error al cargar db-config.json:', error.message);
      console.log('Usando configuración predeterminada');
    }
  } else {
    console.log('Archivo db-config.json no encontrado.');
    console.log('Usando configuración predeterminada con contraseña "postgres123".');
    console.log('Para personalizar la configuración, ejecuta: npm run db:reset-password-direct');
    
    // Guardar la configuración predeterminada
    try {
      if (!fs.existsSync(__dirname)) {
        fs.mkdirSync(__dirname, { recursive: true });
      }
      fs.writeFileSync(dbConfigPath, JSON.stringify(config, null, 2));
      console.log('Se ha creado un archivo de configuración predeterminado en config/db-config.json');
    } catch (err) {
      console.error('No se pudo crear el archivo de configuración predeterminado:', err.message);
    }
  }

  return config;
}

// Cargar la configuración
const dbConfig = loadDatabaseConfig();

// Crear instancia de Sequelize con la configuración
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.user,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: 'postgres',
    logging: false, // Cambiar a console.log para ver las consultas SQL
    dialectOptions: {
      // Opciones adicionales para mayor flexibilidad con PostgreSQL
      connectTimeout: 10000, // 10 segundos de timeout
      application_name: 'angular-curso',
      // Desactivar SSL si es necesario (útil en algunos entornos)
      // ssl: false
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    // Opciones para reintentar conexión
    retry: {
      match: [
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/,
        /SequelizeHostNotReachableError/,
        /SequelizeInvalidConnectionError/,
        /SequelizeConnectionTimedOutError/
      ],
      max: 3 // Máximo 3 intentos
    }
  }
);

// Exporta la conexión
module.exports = sequelize;
