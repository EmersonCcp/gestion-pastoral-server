import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1776631669809 implements MigrationInterface {
    name = 'Migration1776631669809'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."personas_relaciones_parentesco_enum" AS ENUM('PADRE', 'MADRE', 'TUTOR', 'HERMANO', 'CONYUGE', 'HIJO', 'ABUELO', 'TIO', 'PRIMO', 'OTRO')`);
        await queryRunner.query(`CREATE TABLE "personas_relaciones" ("id" SERIAL NOT NULL, "persona_id" integer NOT NULL, "pariente_id" integer NOT NULL, "parentesco" "public"."personas_relaciones_parentesco_enum" NOT NULL DEFAULT 'OTRO', "es_contacto_emergencia" boolean NOT NULL DEFAULT false, "es_responsable_legal" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_00e912e13f203bef52d2334d07f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "personas_relaciones" ADD CONSTRAINT "FK_de313d1984ec0101437d20c5526" FOREIGN KEY ("persona_id") REFERENCES "personas"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "personas_relaciones" ADD CONSTRAINT "FK_1ffd901418df341640887222462" FOREIGN KEY ("pariente_id") REFERENCES "personas"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "personas_relaciones" DROP CONSTRAINT "FK_1ffd901418df341640887222462"`);
        await queryRunner.query(`ALTER TABLE "personas_relaciones" DROP CONSTRAINT "FK_de313d1984ec0101437d20c5526"`);
        await queryRunner.query(`DROP TABLE "personas_relaciones"`);
        await queryRunner.query(`DROP TYPE "public"."personas_relaciones_parentesco_enum"`);
    }

}
