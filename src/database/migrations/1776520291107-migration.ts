import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1776520291107 implements MigrationInterface {
    name = 'Migration1776520291107'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "libros" ADD "movimiento_id" integer`);
        await queryRunner.query(`ALTER TABLE "libros_movimientos" ADD "movimiento_id" integer`);
        await queryRunner.query(`ALTER TABLE "libros_asignaciones" ADD "movimiento_id" integer`);
        await queryRunner.query(`ALTER TABLE "libros" ADD CONSTRAINT "FK_4fd87f2e1e286d61297d20e4ad5" FOREIGN KEY ("movimiento_id") REFERENCES "movimientos"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "libros_movimientos" ADD CONSTRAINT "FK_84bf11a04f3731260e716642c0c" FOREIGN KEY ("movimiento_id") REFERENCES "movimientos"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "libros_asignaciones" ADD CONSTRAINT "FK_fec7d758f6f9564c803470bba2c" FOREIGN KEY ("movimiento_id") REFERENCES "movimientos"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "libros_asignaciones" DROP CONSTRAINT "FK_fec7d758f6f9564c803470bba2c"`);
        await queryRunner.query(`ALTER TABLE "libros_movimientos" DROP CONSTRAINT "FK_84bf11a04f3731260e716642c0c"`);
        await queryRunner.query(`ALTER TABLE "libros" DROP CONSTRAINT "FK_4fd87f2e1e286d61297d20e4ad5"`);
        await queryRunner.query(`ALTER TABLE "libros_asignaciones" DROP COLUMN "movimiento_id"`);
        await queryRunner.query(`ALTER TABLE "libros_movimientos" DROP COLUMN "movimiento_id"`);
        await queryRunner.query(`ALTER TABLE "libros" DROP COLUMN "movimiento_id"`);
    }

}
