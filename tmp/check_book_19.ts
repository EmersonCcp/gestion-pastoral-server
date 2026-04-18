import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'mssql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
});

async function check() {
  await AppDataSource.initialize();
  
  const ejemplares = await AppDataSource.query(`
    SELECT ej.id, ej.nro_identificador, ej.estado, s.id as sede_id, s.nombre as sede_nombre
    FROM ejemplares ej
    JOIN sedes s ON s.id = ej.sede_id
    WHERE ej.libro_id = 19
  `);

  const reservas = await AppDataSource.query(`
    SELECT r.id, r.fecha, r.horario_inicio_reserva, r.horario_final_reserva, r.estado, re.ejemplar_id
    FROM reservas r
    JOIN reserva_ejemplares re ON re.reserva_id = r.id
    WHERE re.libro_id = 19 AND r.estado NOT IN ('CANCELADO', 'COMPLETADO')
  `);

  console.log(JSON.stringify({ ejemplares, reservas }, null, 2));

  await AppDataSource.destroy();
}

check().catch(console.error);
