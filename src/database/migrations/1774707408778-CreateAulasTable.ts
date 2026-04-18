import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAulasTable1774707408778 implements MigrationInterface {
    name = 'CreateAulasTable1774707408778'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "aulas" ("id" SERIAL NOT NULL, "nombre" character varying NOT NULL, "capacidad" integer, "ubicacion" character varying, "parroquia_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1c24faf8a7f2309f6b44679ee91" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "aulas" ADD CONSTRAINT "FK_637a42a62c2ec9fba34c1505a72" FOREIGN KEY ("parroquia_id") REFERENCES "parroquias"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "aulas" DROP CONSTRAINT "FK_637a42a62c2ec9fba34c1505a72"`);
        await queryRunner.query(`DROP TABLE "aulas"`);
    }

}
