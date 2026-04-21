
const { Client } = require('pg');
require('dotenv').config();

async function runMigration() {
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
    console.log('Connected to database.');

    await client.query('BEGIN');

    // 1. Get IDs of personas without any type
    const queryFind = `
      SELECT p.id FROM personas p
      LEFT JOIN personas_tipos_asignados pta ON p.id = pta.persona_id
      WHERE pta.persona_id IS NULL
    `;
    const res = await client.query(queryFind);
    const personaIds = res.rows.map(row => row.id);

    console.log(`Found ${personaIds.length} personas to update.`);

    if (personaIds.length === 0) {
      console.log('No personas need update.');
      await client.query('COMMIT');
      return;
    }

    // 2. Insert into join table
    // Constructing multiple inserts to be efficient
    const tipoId = 9; // Pariente
    const values = personaIds.map(pid => `(${pid}, ${tipoId})`).join(',');
    
    const queryInsert = `
      INSERT INTO personas_tipos_asignados (persona_id, tipo_persona_id)
      VALUES ${values}
    `;

    const resInsert = await client.query(queryInsert);
    console.log(`Successfully assigned type 9 to ${resInsert.rowCount} personas.`);

    await client.query('COMMIT');
    console.log('Transaction committed successfully.');

  } catch (err) {
    if (client) {
      await client.query('ROLLBACK');
      console.log('Transaction rolled back due to error.');
    }
    console.error('Migration failed:', err);
  } finally {
    await client.end();
  }
}

runMigration();
