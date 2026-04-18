import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAsistenciasTables1774715721789 implements MigrationInterface {
    name = 'CreateAsistenciasTables1774715721789'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."asistencia_personas_estado_enum" AS ENUM('PRESENTE', 'AUSENTE', 'JUSTIFICADO')`);
        await queryRunner.query(`CREATE TABLE "asistencia_personas" ("id" SERIAL NOT NULL, "asistencia_id" integer NOT NULL, "persona_id" integer NOT NULL, "estado" "public"."asistencia_personas_estado_enum" NOT NULL DEFAULT 'PRESENTE', "observacion" text, CONSTRAINT "PK_72b7d57d52c433fca3f309eaa8a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "asistencias" ("id" SERIAL NOT NULL, "fecha" date NOT NULL, "observacion" text, "grupo_id" integer NOT NULL, "periodo_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f7eb09d44d6c7dd4ccc6eb29af8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "asistencia_personas" ADD CONSTRAINT "FK_a9232be94d25cdf095273ac8916" FOREIGN KEY ("asistencia_id") REFERENCES "asistencias"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "asistencia_personas" ADD CONSTRAINT "FK_7e8d87d17f4746041f2f12004d3" FOREIGN KEY ("persona_id") REFERENCES "personas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "asistencias" ADD CONSTRAINT "FK_d88deaf0434b1e991a9f1e85f33" FOREIGN KEY ("grupo_id") REFERENCES "grupos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "asistencias" ADD CONSTRAINT "FK_0b19ca26ec2d44f3d0ce895ff3e" FOREIGN KEY ("periodo_id") REFERENCES "periodos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "asistencias" DROP CONSTRAINT "FK_0b19ca26ec2d44f3d0ce895ff3e"`);
        await queryRunner.query(`ALTER TABLE "asistencias" DROP CONSTRAINT "FK_d88deaf0434b1e991a9f1e85f33"`);
        await queryRunner.query(`ALTER TABLE "asistencia_personas" DROP CONSTRAINT "FK_7e8d87d17f4746041f2f12004d3"`);
        await queryRunner.query(`ALTER TABLE "asistencia_personas" DROP CONSTRAINT "FK_a9232be94d25cdf095273ac8916"`);
        await queryRunner.query(`DROP TABLE "asistencias"`);
        await queryRunner.query(`DROP TABLE "asistencia_personas"`);
        await queryRunner.query(`DROP TYPE "public"."asistencia_personas_estado_enum"`);
    }

}
