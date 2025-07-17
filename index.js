const oracledb = require('oracledb');
require('dotenv').config();

// Oracle DB configuration
const dbConfig = {
  user: process.env.User,
  password: process.env.Password,
  connectString: `${process.env.Host}:${process.env.Port}/${process.env.Database}`,
  poolMin: 1,
  poolMax: 5,
  poolIncrement: 1,
  poolTimeout: 60
};

let pool;

async function initializePool() {
  try {
    pool = await oracledb.createPool(dbConfig);
    console.log('Oracle DB pool created');
  } catch (err) {
    console.error('Oracle DB pool creation failed:', err);
    throw err;
  }
}

async function getConnection() {
  try {
    const connection = await pool.getConnection();
    return connection;
  } catch (err) {
    console.error('Error getting Oracle DB connection:', err);
    throw err;
  }
}

module.exports = {
  initializePool,
  getConnection,
  pool
};