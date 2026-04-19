import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1776514366038 implements MigrationInterface {
    name = 'Migration1776514366038'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "temas" ("id" SERIAL NOT NULL, "numero_tema" integer NOT NULL, "titulo" character varying NOT NULL, "descripcion" text, "libro_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8c74c55b130d5a91f7d5f575d63" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "libros" ("id" SERIAL NOT NULL, "nombre" character varying NOT NULL, "descripcion" text, "tipo_persona_id" integer NOT NULL, "estado" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_63bdc208aaf1ed7e4df6dba27a6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "desarrollo_clases" ("id" SERIAL NOT NULL, "fecha" date NOT NULL, "observaciones" text, "grupo_id" integer NOT NULL, "libro_id" integer NOT NULL, "asistencia_id" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_add3dc579ee2a8aca0505ac35a" UNIQUE ("asistencia_id"), CONSTRAINT "PK_57561d9e38106aebedee07a2ed1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "grupos_libros" ("grupo_id" integer NOT NULL, "libro_id" integer NOT NULL, CONSTRAINT "PK_49781602b032dfab820190de068" PRIMARY KEY ("grupo_id", "libro_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_3a0537f468317b343d9822ba28" ON "grupos_libros" ("grupo_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_e7d541fd520dbef299f365b50d" ON "grupos_libros" ("libro_id") `);
        await queryRunner.query(`CREATE TABLE "desarrollo_clases_temas" ("desarrollo_clase_id" integer NOT NULL, "tema_id" integer NOT NULL, CONSTRAINT "PK_76d0b9536acf821f09c0f80c89d" PRIMARY KEY ("desarrollo_clase_id", "tema_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_db83da43f7969a03d74506ee9f" ON "desarrollo_clases_temas" ("desarrollo_clase_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_91711396d1758c4ddd79df9aec" ON "desarrollo_clases_temas" ("tema_id") `);
        await queryRunner.query(`ALTER TABLE "temas" ADD CONSTRAINT "FK_1966ddb5ae1793ba9b4a357cad5" FOREIGN KEY ("libro_id") REFERENCES "libros"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "libros" ADD CONSTRAINT "FK_108f03be7ad985c36237356fe37" FOREIGN KEY ("tipo_persona_id") REFERENCES "tipos_personas"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "desarrollo_clases" ADD CONSTRAINT "FK_ad47cdd5118bb27c8acc9dfd624" FOREIGN KEY ("grupo_id") REFERENCES "grupos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "desarrollo_clases" ADD CONSTRAINT "FK_745185895587dec59aa684af305" FOREIGN KEY ("libro_id") REFERENCES "libros"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "desarrollo_clases" ADD CONSTRAINT "FK_add3dc579ee2a8aca0505ac35a0" FOREIGN KEY ("asistencia_id") REFERENCES "asistencias"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "grupos_libros" ADD CONSTRAINT "FK_3a0537f468317b343d9822ba289" FOREIGN KEY ("grupo_id") REFERENCES "grupos"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "grupos_libros" ADD CONSTRAINT "FK_e7d541fd520dbef299f365b50d3" FOREIGN KEY ("libro_id") REFERENCES "libros"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "desarrollo_clases_temas" ADD CONSTRAINT "FK_db83da43f7969a03d74506ee9f5" FOREIGN KEY ("desarrollo_clase_id") REFERENCES "desarrollo_clases"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "desarrollo_clases_temas" ADD CONSTRAINT "FK_91711396d1758c4ddd79df9aecc" FOREIGN KEY ("tema_id") REFERENCES "temas"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "desarrollo_clases_temas" DROP CONSTRAINT "FK_91711396d1758c4ddd79df9aecc"`);
        await queryRunner.query(`ALTER TABLE "desarrollo_clases_temas" DROP CONSTRAINT "FK_db83da43f7969a03d74506ee9f5"`);
        await queryRunner.query(`ALTER TABLE "grupos_libros" DROP CONSTRAINT "FK_e7d541fd520dbef299f365b50d3"`);
        await queryRunner.query(`ALTER TABLE "grupos_libros" DROP CONSTRAINT "FK_3a0537f468317b343d9822ba289"`);
        await queryRunner.query(`ALTER TABLE "desarrollo_clases" DROP CONSTRAINT "FK_add3dc579ee2a8aca0505ac35a0"`);
        await queryRunner.query(`ALTER TABLE "desarrollo_clases" DROP CONSTRAINT "FK_745185895587dec59aa684af305"`);
        await queryRunner.query(`ALTER TABLE "desarrollo_clases" DROP CONSTRAINT "FK_ad47cdd5118bb27c8acc9dfd624"`);
        await queryRunner.query(`ALTER TABLE "libros" DROP CONSTRAINT "FK_108f03be7ad985c36237356fe37"`);
        await queryRunner.query(`ALTER TABLE "temas" DROP CONSTRAINT "FK_1966ddb5ae1793ba9b4a357cad5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_91711396d1758c4ddd79df9aec"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_db83da43f7969a03d74506ee9f"`);
        await queryRunner.query(`DROP TABLE "desarrollo_clases_temas"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e7d541fd520dbef299f365b50d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3a0537f468317b343d9822ba28"`);
        await queryRunner.query(`DROP TABLE "grupos_libros"`);
        await queryRunner.query(`DROP TABLE "desarrollo_clases"`);
        await queryRunner.query(`DROP TABLE "libros"`);
        await queryRunner.query(`DROP TABLE "temas"`);
    }

}
