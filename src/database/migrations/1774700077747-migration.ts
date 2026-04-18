import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1774700077747 implements MigrationInterface {
    name = 'Migration1774700077747'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "estado"`);
        await queryRunner.query(`ALTER TABLE "roles" ADD "estado" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "usuarios" DROP COLUMN "is_super_user"`);
        await queryRunner.query(`ALTER TABLE "usuarios" ADD "is_super_user" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "usuarios" DROP COLUMN "estado"`);
        await queryRunner.query(`ALTER TABLE "usuarios" ADD "estado" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "usuarios_sesiones" DROP COLUMN "estado"`);
        await queryRunner.query(`ALTER TABLE "usuarios_sesiones" ADD "estado" boolean NOT NULL DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "usuarios_sesiones" DROP COLUMN "estado"`);
        await queryRunner.query(`ALTER TABLE "usuarios_sesiones" ADD "estado" bit NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE "usuarios" DROP COLUMN "estado"`);
        await queryRunner.query(`ALTER TABLE "usuarios" ADD "estado" bit NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE "usuarios" DROP COLUMN "is_super_user"`);
        await queryRunner.query(`ALTER TABLE "usuarios" ADD "is_super_user" bit NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "estado"`);
        await queryRunner.query(`ALTER TABLE "roles" ADD "estado" bit NOT NULL DEFAULT '1'`);
    }

}
