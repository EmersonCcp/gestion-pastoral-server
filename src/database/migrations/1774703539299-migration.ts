import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1774703539299 implements MigrationInterface {
    name = 'Migration1774703539299'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "parroquias" ("id" SERIAL NOT NULL, "nombre" character varying NOT NULL, "direccion" character varying, "telefono" character varying, "email" character varying, "descripcion" text, "estado" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9f7ab538e0ed1a3f6773e3877fa" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "parroquias"`);
    }

}
