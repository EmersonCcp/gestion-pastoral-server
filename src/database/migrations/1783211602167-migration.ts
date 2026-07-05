import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1783211602167 implements MigrationInterface {
    name = 'Migration1783211602167'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "usuario_grupos" ("usuario_id" integer NOT NULL, "grupo_id" integer NOT NULL, CONSTRAINT "PK_68be546f5b645ccfa2f5fdf9c28" PRIMARY KEY ("usuario_id", "grupo_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_db676fa76c70fe07c9d5b7b17f" ON "usuario_grupos" ("usuario_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_a2a563dc17e73c18eff0aa3ca3" ON "usuario_grupos" ("grupo_id") `);
        await queryRunner.query(`ALTER TABLE "usuario_grupos" ADD CONSTRAINT "FK_db676fa76c70fe07c9d5b7b17f6" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "usuario_grupos" ADD CONSTRAINT "FK_a2a563dc17e73c18eff0aa3ca38" FOREIGN KEY ("grupo_id") REFERENCES "grupos"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "usuario_grupos" DROP CONSTRAINT "FK_a2a563dc17e73c18eff0aa3ca38"`);
        await queryRunner.query(`ALTER TABLE "usuario_grupos" DROP CONSTRAINT "FK_db676fa76c70fe07c9d5b7b17f6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a2a563dc17e73c18eff0aa3ca3"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_db676fa76c70fe07c9d5b7b17f"`);
        await queryRunner.query(`DROP TABLE "usuario_grupos"`);
    }

}
