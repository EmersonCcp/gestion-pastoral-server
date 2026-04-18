import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTimeToAsignacion1774714137468 implements MigrationInterface {
    name = 'AddTimeToAsignacion1774714137468'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "asignaciones" ADD "hora_inicio" character varying`);
        await queryRunner.query(`ALTER TABLE "asignaciones" ADD "hora_fin" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "asignaciones" DROP COLUMN "hora_fin"`);
        await queryRunner.query(`ALTER TABLE "asignaciones" DROP COLUMN "hora_inicio"`);
    }

}
