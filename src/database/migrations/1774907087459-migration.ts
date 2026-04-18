import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1774907087459 implements MigrationInterface {
    name = 'Migration1774907087459'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "usuarios" ADD "parroquia_id" integer`);
        await queryRunner.query(`ALTER TABLE "periodos" ADD "movimiento_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "aulas" ADD "movimiento_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tipos_personas" ADD "movimiento_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "personas" ADD "movimiento_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "asignaciones" ADD "movimiento_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "asistencias" ADD "movimiento_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tipos_personas" DROP CONSTRAINT "UQ_cc003602239f7a0b4ff57702a4c"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_7e337401f11ba49c0e1b1f1df6" ON "tipos_personas" ("nombre", "movimiento_id") `);
        await queryRunner.query(`ALTER TABLE "usuarios" ADD CONSTRAINT "FK_b17d57019d1366806225000b567" FOREIGN KEY ("parroquia_id") REFERENCES "parroquias"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "periodos" ADD CONSTRAINT "FK_c393586a24961769bf4aa0cd65b" FOREIGN KEY ("movimiento_id") REFERENCES "movimientos"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "aulas" ADD CONSTRAINT "FK_a40c78af9f88abe19e9e00cd7b2" FOREIGN KEY ("movimiento_id") REFERENCES "movimientos"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tipos_personas" ADD CONSTRAINT "FK_3b7eab9de64d4f4d0460fdddf00" FOREIGN KEY ("movimiento_id") REFERENCES "movimientos"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "personas" ADD CONSTRAINT "FK_456863491358d4efe1e39060431" FOREIGN KEY ("movimiento_id") REFERENCES "movimientos"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "asignaciones" ADD CONSTRAINT "FK_56987bca0f0b5461280b73841ae" FOREIGN KEY ("movimiento_id") REFERENCES "movimientos"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "asistencias" ADD CONSTRAINT "FK_ebe057726fae52beb3d1f1faa11" FOREIGN KEY ("movimiento_id") REFERENCES "movimientos"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "asistencias" DROP CONSTRAINT "FK_ebe057726fae52beb3d1f1faa11"`);
        await queryRunner.query(`ALTER TABLE "asignaciones" DROP CONSTRAINT "FK_56987bca0f0b5461280b73841ae"`);
        await queryRunner.query(`ALTER TABLE "personas" DROP CONSTRAINT "FK_456863491358d4efe1e39060431"`);
        await queryRunner.query(`ALTER TABLE "tipos_personas" DROP CONSTRAINT "FK_3b7eab9de64d4f4d0460fdddf00"`);
        await queryRunner.query(`ALTER TABLE "aulas" DROP CONSTRAINT "FK_a40c78af9f88abe19e9e00cd7b2"`);
        await queryRunner.query(`ALTER TABLE "periodos" DROP CONSTRAINT "FK_c393586a24961769bf4aa0cd65b"`);
        await queryRunner.query(`ALTER TABLE "usuarios" DROP CONSTRAINT "FK_b17d57019d1366806225000b567"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7e337401f11ba49c0e1b1f1df6"`);
        await queryRunner.query(`ALTER TABLE "tipos_personas" ADD CONSTRAINT "UQ_cc003602239f7a0b4ff57702a4c" UNIQUE ("nombre")`);
        await queryRunner.query(`ALTER TABLE "asistencias" DROP COLUMN "movimiento_id"`);
        await queryRunner.query(`ALTER TABLE "asignaciones" DROP COLUMN "movimiento_id"`);
        await queryRunner.query(`ALTER TABLE "personas" DROP COLUMN "movimiento_id"`);
        await queryRunner.query(`ALTER TABLE "tipos_personas" DROP COLUMN "movimiento_id"`);
        await queryRunner.query(`ALTER TABLE "aulas" DROP COLUMN "movimiento_id"`);
        await queryRunner.query(`ALTER TABLE "periodos" DROP COLUMN "movimiento_id"`);
        await queryRunner.query(`ALTER TABLE "usuarios" DROP COLUMN "parroquia_id"`);
    }

}
