import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPersonaDocuments1776611183740 implements MigrationInterface {
    name = 'AddPersonaDocuments1776611183740'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "persona_documentos" ("id" SERIAL NOT NULL, "nombre" character varying NOT NULL, "url" text NOT NULL, "path" text NOT NULL, "tipo" character varying, "persona_id" integer NOT NULL, "movimiento_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_82dae9c337c4d0a348adf9327a0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "persona_documentos" ADD CONSTRAINT "FK_f20151e917154154093ff3baa91" FOREIGN KEY ("persona_id") REFERENCES "personas"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "persona_documentos" ADD CONSTRAINT "FK_f56e768ba9b02da78e0f546999e" FOREIGN KEY ("movimiento_id") REFERENCES "movimientos"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "persona_documentos" DROP CONSTRAINT "FK_f56e768ba9b02da78e0f546999e"`);
        await queryRunner.query(`ALTER TABLE "persona_documentos" DROP CONSTRAINT "FK_f20151e917154154093ff3baa91"`);
        await queryRunner.query(`DROP TABLE "persona_documentos"`);
    }

}
