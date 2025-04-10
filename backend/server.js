const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;
const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');

// Cargar configuración desde el archivo
let dbConfig;
try {
  const configPath = path.join(__dirname, '..', 'config', 'db-config.json');
  dbConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  console.log('Configuración de base de datos cargada desde config/db-config.json');
} catch (error) {
  console.error('Error al cargar la configuración:', error.message);
  console.log('Usando configuración predeterminada');
  
  // Configuración predeterminada basada en la inspección
  dbConfig = {
    host: 'localhost',
    port: 5432,
    database: 'my_database',
    user: 'admin',
    password: 'admin'
  };
}

// Crear instancia de Sequelize
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.user,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      connectTimeout: 10000
    }
  }
);

// Definir el modelo de Usuario
const User = sequelize.define('users', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.fn('NOW')
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.fn('NOW')
  }
}, {
  timestamps: false
});

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta para obtener todos los usuarios
app.get('/users', async (req, res) => {
  try {
    // Extraer parámetros de paginación
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.per_page) || 10;
    const offset = (page - 1) * perPage;
    
    // Realizar la consulta con paginación
    const { count, rows } = await User.findAndCountAll({
      offset,
      limit: perPage,
      order: [['id', 'ASC']]
    });
    
    // Devolver respuesta paginada
    res.json({
      users: rows,
      total: count,
      page,
      per_page: perPage,
      total_pages: Math.ceil(count / perPage)
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: error.message });
  }
});

// Ruta para obtener un usuario por ID
app.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ error: error.message });
  }
});

// Ruta para crear un usuario
app.post('/users', async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(400).json({ error: error.message });
  }
});

// Ruta para actualizar un usuario
app.put('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const userData = req.body;
    
    // Obtener el usuario existente
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Actualizar el timestamp
    userData.updated_at = new Date();
    
    // Actualizar el usuario
    await user.update(userData);
    
    res.json(user);
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: error.message });
  }
});

// Ruta para eliminar un usuario
app.delete('/users/:id', async (req, res) => {
  try {
    const deleted = await User.destroy({
      where: { id: req.params.id }
    });
    if (!deleted) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: error.message });
  }
});

// Ruta para sembrar la base de datos
app.post('/seed', async (req, res) => {
  try {
    const count = req.body.count || 50;
    const users = [];
    
    for (let i = 1; i <= count; i++) {
      users.push({
        name: `Usuario ${i}`,
        email: `usuario${i}@example.com`,
        password: `password${i}`,
        created_at: new Date(),
        updated_at: new Date()
      });
    }
    
    await User.bulkCreate(users);
    res.json({ 
      message: `${count} usuarios creados correctamente`,
      count
    });
  } catch (error) {
    console.error('Error al sembrar la base de datos:', error);
    res.status(500).json({ error: error.message });
  }
});

// Ruta para verificar el estado
app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    const count = await User.count();
    res.json({ 
      status: 'OK', 
      database: 'Connected',
      count
    });
  } catch (error) {
    console.error('Error en verificación de salud:', error);
    res.status(500).json({ status: 'ERROR', error: error.message });
  }
});

// Iniciar el servidor
app.listen(port, async () => {
  try {
    // Probar la conexión a la base de datos
    await sequelize.authenticate();
    console.log('Conexión a PostgreSQL establecida correctamente con:');
    console.log(`- Base de datos: ${dbConfig.database}`);
    console.log(`- Usuario: ${dbConfig.user}`);
    console.log(`- Host: ${dbConfig.host}:${dbConfig.port}`);
    
    // Sincronizar el modelo (solo si no existe)
    await sequelize.sync({ alter: true });
    console.log('Modelo sincronizado correctamente');
    
    console.log(`Servidor API ejecutándose en http://localhost:${port}`);
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
    console.log('\nRecomendaciones:');
    console.log('1. Verifica que el contenedor PostgreSQL esté en ejecución');
    console.log('2. Comprueba la configuración en config/db-config.json');
    console.log('3. Ejecuta el script de verificación: npm run verify-postgres');
  }
});
