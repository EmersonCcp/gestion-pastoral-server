import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1776614563514 implements MigrationInterface {
    name = 'Migration1776614563514'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "desarrollo_clases" DROP CONSTRAINT "FK_745185895587dec59aa684af305"`);
        await queryRunner.query(`ALTER TABLE "desarrollo_clases" ALTER COLUMN "libro_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "desarrollo_clases" ADD CONSTRAINT "FK_745185895587dec59aa684af305" FOREIGN KEY ("libro_id") REFERENCES "libros"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "desarrollo_clases" DROP CONSTRAINT "FK_745185895587dec59aa684af305"`);
        await queryRunner.query(`ALTER TABLE "desarrollo_clases" ALTER COLUMN "libro_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "desarrollo_clases" ADD CONSTRAINT "FK_745185895587dec59aa684af305" FOREIGN KEY ("libro_id") REFERENCES "libros"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
