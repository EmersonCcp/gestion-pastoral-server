import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1776606359771 implements MigrationInterface {
    name = 'Migration1776606359771'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "personas" DROP CONSTRAINT "FK_9e4df67b9a584eacfd8c6065b0d"`);
        await queryRunner.query(`CREATE TABLE "personas_tipos_asignados" ("persona_id" integer NOT NULL, "tipo_persona_id" integer NOT NULL, CONSTRAINT "PK_27421308fe00e92649b753cd73c" PRIMARY KEY ("persona_id", "tipo_persona_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_8a4f4901dedd7f49b98c8343d5" ON "personas_tipos_asignados" ("persona_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_4ebda9783e62366020e0e1f634" ON "personas_tipos_asignados" ("tipo_persona_id") `);
        await queryRunner.query(`ALTER TABLE "personas" DROP COLUMN "tipo_persona_id"`);
        await queryRunner.query(`ALTER TABLE "personas_tipos_asignados" ADD CONSTRAINT "FK_8a4f4901dedd7f49b98c8343d55" FOREIGN KEY ("persona_id") REFERENCES "personas"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "personas_tipos_asignados" ADD CONSTRAINT "FK_4ebda9783e62366020e0e1f6348" FOREIGN KEY ("tipo_persona_id") REFERENCES "tipos_personas"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "personas_tipos_asignados" DROP CONSTRAINT "FK_4ebda9783e62366020e0e1f6348"`);
        await queryRunner.query(`ALTER TABLE "personas_tipos_asignados" DROP CONSTRAINT "FK_8a4f4901dedd7f49b98c8343d55"`);
        await queryRunner.query(`ALTER TABLE "personas" ADD "tipo_persona_id" integer NOT NULL`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4ebda9783e62366020e0e1f634"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8a4f4901dedd7f49b98c8343d5"`);
        await queryRunner.query(`DROP TABLE "personas_tipos_asignados"`);
        await queryRunner.query(`ALTER TABLE "personas" ADD CONSTRAINT "FK_9e4df67b9a584eacfd8c6065b0d" FOREIGN KEY ("tipo_persona_id") REFERENCES "tipos_personas"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

}
