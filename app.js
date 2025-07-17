const express = require('express');
const { initializePool, getConnection } = require('./db');
const employeeRoutes = require('./Router/route')
require('dotenv').config();

const app = express();
app.use(express.json());

app.use('/api', employeeRoutes);

app.get('/health', async (req, res) => {
  try {
    const client = await getConnection();
    try {
      const result = await client.execute('SELECT SYSDATE FROM DUAL'); // Oracle syntax
      res.json({ 
        status: 'healthy',
        databaseTime: result.rows[0][0], // Oracle returns array of arrays
        database: process.env.Database,
        host: process.env.Host
      });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Detailed DB connection error:', {
      message: err.message,
      code: err.code,
      stack: err.stack
    });
    
    res.json({ 
      status: 'unhealthy',
      error: 'Cannot reach database',
      details: {
        host: process.env.Host,
        port: process.env.Port,
        database: process.env.Database,
        error: err.message
      }
    });
  }
});

// Start listening
const PORT = 3000;
async function initializeApp() {
  await initializePool();
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
    console.log('Database configuration:', {
      host: process.env.Host,
      port: process.env.Port,
      database: process.env.Database,
      user: process.env.User
    });
  });
}

initializeApp();