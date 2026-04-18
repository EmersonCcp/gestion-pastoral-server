import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1774704998179 implements MigrationInterface {
    name = 'Migration1774704998179'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "grupos" ("id" SERIAL NOT NULL, "nombre" character varying NOT NULL, "descripcion" text, "estado" boolean NOT NULL DEFAULT true, "movimiento_id" integer NOT NULL, "parent_id" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_34de64ec8a5ecd99afb23b2bd62" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "grupos" ADD CONSTRAINT "FK_d68403ae215d510a2b6e86ec4de" FOREIGN KEY ("movimiento_id") REFERENCES "movimientos"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "grupos" ADD CONSTRAINT "FK_16753c1a93fd523c8e8ccd66cdd" FOREIGN KEY ("parent_id") REFERENCES "grupos"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "grupos" DROP CONSTRAINT "FK_16753c1a93fd523c8e8ccd66cdd"`);
        await queryRunner.query(`ALTER TABLE "grupos" DROP CONSTRAINT "FK_d68403ae215d510a2b6e86ec4de"`);
        await queryRunner.query(`DROP TABLE "grupos"`);
    }

}
