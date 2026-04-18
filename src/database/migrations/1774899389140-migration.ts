import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1774899389140 implements MigrationInterface {
    name = 'Migration1774899389140'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "usuario_movimientos" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "usuario_id" integer NOT NULL, "movimiento_id" integer NOT NULL, CONSTRAINT "PK_a5e68466352bd4bdecafa5dd11e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_3f959d00f022c19a28d4f91ae9" ON "usuario_movimientos" ("usuario_id", "movimiento_id") `);
        await queryRunner.query(`ALTER TABLE "usuario_movimientos" ADD CONSTRAINT "FK_b637d3cad5e0c272f89ac8be693" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "usuario_movimientos" ADD CONSTRAINT "FK_32b40d5a1383a1905e3bf1bac69" FOREIGN KEY ("movimiento_id") REFERENCES "movimientos"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "usuario_movimientos" DROP CONSTRAINT "FK_32b40d5a1383a1905e3bf1bac69"`);
        await queryRunner.query(`ALTER TABLE "usuario_movimientos" DROP CONSTRAINT "FK_b637d3cad5e0c272f89ac8be693"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3f959d00f022c19a28d4f91ae9"`);
        await queryRunner.query(`DROP TABLE "usuario_movimientos"`);
    }

}
