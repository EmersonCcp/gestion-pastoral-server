
const { Client } = require('pg');
require('dotenv').config();

async function checkData() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    // Check if TipoPersona 9 exists
    const resTipo = await client.query('SELECT * FROM tipos_personas WHERE id = 9');
    console.log('TipoPersona 9:', resTipo.rows[0] || 'NOT FOUND');

    // Count people with no types
    const resCount = await client.query(`
      SELECT COUNT(*) FROM personas p
      LEFT JOIN personas_tipos_asignados pta ON p.id = pta.persona_id
      WHERE pta.persona_id IS NULL
    `);
    console.log('Personas without type:', resCount.rows[0].count);

  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

checkData();
