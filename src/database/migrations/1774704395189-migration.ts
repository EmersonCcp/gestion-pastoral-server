import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1774704395189 implements MigrationInterface {
    name = 'Migration1774704395189'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "movimientos" ("id" SERIAL NOT NULL, "nombre" character varying NOT NULL, "descripcion" text, "estado" boolean NOT NULL DEFAULT true, "parroquia_id" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_519702aa97def3e7c1b6cc5e2f9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "movimientos" ADD CONSTRAINT "FK_338ba5919af41e38747948405cc" FOREIGN KEY ("parroquia_id") REFERENCES "parroquias"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "movimientos" DROP CONSTRAINT "FK_338ba5919af41e38747948405cc"`);
        await queryRunner.query(`DROP TABLE "movimientos"`);
    }

}
