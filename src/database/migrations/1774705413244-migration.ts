import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1774705413244 implements MigrationInterface {
    name = 'Migration1774705413244'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "periodos" ("id" SERIAL NOT NULL, "nombre" character varying NOT NULL, "fecha_inicio" date NOT NULL, "fecha_fin" date NOT NULL, "activo" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0a07197c62bd108e09117089202" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "periodos"`);
    }

}
