import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1774705890486 implements MigrationInterface {
    name = 'Migration1774705890486'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "personas" ("id" SERIAL NOT NULL, "nombre" character varying NOT NULL, "apellido" character varying NOT NULL, "documento" character varying NOT NULL, "email" character varying, "telefono" character varying, "direccion" character varying, "tipo_persona_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_8fc56f72924ee1cf3181f8ea937" UNIQUE ("documento"), CONSTRAINT "PK_714aa5d028f8f3e6645e971cecd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tipos_personas" ("id" SERIAL NOT NULL, "nombre" character varying NOT NULL, "descripcion" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_cc003602239f7a0b4ff57702a4c" UNIQUE ("nombre"), CONSTRAINT "PK_d7b1f9abc737cdab8717e350c4b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "personas" ADD CONSTRAINT "FK_9e4df67b9a584eacfd8c6065b0d" FOREIGN KEY ("tipo_persona_id") REFERENCES "tipos_personas"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "personas" DROP CONSTRAINT "FK_9e4df67b9a584eacfd8c6065b0d"`);
        await queryRunner.query(`DROP TABLE "tipos_personas"`);
        await queryRunner.query(`DROP TABLE "personas"`);
    }

}
