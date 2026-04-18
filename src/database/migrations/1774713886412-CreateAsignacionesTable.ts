import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAsignacionesTable1774713886412 implements MigrationInterface {
    name = 'CreateAsignacionesTable1774713886412'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "asignaciones" ("id" SERIAL NOT NULL, "dia_reunion" character varying, "frecuencia" character varying, "grupo_id" integer NOT NULL, "periodo_id" integer NOT NULL, "aula_id" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6c11ab1a82249192bc2e2763d3a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "asignacion_personas" ("asignacion_id" integer NOT NULL, "persona_id" integer NOT NULL, CONSTRAINT "PK_24dc12debc2cbfbd346b7d34e99" PRIMARY KEY ("asignacion_id", "persona_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_58d190434540749cafb86a07ef" ON "asignacion_personas" ("asignacion_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_08f53dc29d7ddf6fc791c8a547" ON "asignacion_personas" ("persona_id") `);
        await queryRunner.query(`ALTER TABLE "asignaciones" ADD CONSTRAINT "FK_f6609d084610d9ff0aadffc6c94" FOREIGN KEY ("grupo_id") REFERENCES "grupos"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "asignaciones" ADD CONSTRAINT "FK_269bfd5d7aa868bad28379a4629" FOREIGN KEY ("periodo_id") REFERENCES "periodos"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "asignaciones" ADD CONSTRAINT "FK_b1abce5db8f34a55e3a24325582" FOREIGN KEY ("aula_id") REFERENCES "aulas"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "asignacion_personas" ADD CONSTRAINT "FK_58d190434540749cafb86a07ef5" FOREIGN KEY ("asignacion_id") REFERENCES "asignaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "asignacion_personas" ADD CONSTRAINT "FK_08f53dc29d7ddf6fc791c8a547f" FOREIGN KEY ("persona_id") REFERENCES "personas"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "asignacion_personas" DROP CONSTRAINT "FK_08f53dc29d7ddf6fc791c8a547f"`);
        await queryRunner.query(`ALTER TABLE "asignacion_personas" DROP CONSTRAINT "FK_58d190434540749cafb86a07ef5"`);
        await queryRunner.query(`ALTER TABLE "asignaciones" DROP CONSTRAINT "FK_b1abce5db8f34a55e3a24325582"`);
        await queryRunner.query(`ALTER TABLE "asignaciones" DROP CONSTRAINT "FK_269bfd5d7aa868bad28379a4629"`);
        await queryRunner.query(`ALTER TABLE "asignaciones" DROP CONSTRAINT "FK_f6609d084610d9ff0aadffc6c94"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_08f53dc29d7ddf6fc791c8a547"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_58d190434540749cafb86a07ef"`);
        await queryRunner.query(`DROP TABLE "asignacion_personas"`);
        await queryRunner.query(`DROP TABLE "asignaciones"`);
    }

}
