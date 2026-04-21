import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1776720365166 implements MigrationInterface {
    name = 'Migration1776720365166'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "personas" ADD "bautismo" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "personas" ADD "primera_comunion" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "personas" ADD "confirmacion" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "personas" DROP COLUMN "confirmacion"`);
        await queryRunner.query(`ALTER TABLE "personas" DROP COLUMN "primera_comunion"`);
        await queryRunner.query(`ALTER TABLE "personas" DROP COLUMN "bautismo"`);
    }

}
