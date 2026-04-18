import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatePersonaFields1774706191562 implements MigrationInterface {
    name = 'UpdatePersonaFields1774706191562'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "personas" ADD "genero" character varying`);
        await queryRunner.query(`ALTER TABLE "personas" ADD "fecha_nacimiento" date`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "personas" DROP COLUMN "fecha_nacimiento"`);
        await queryRunner.query(`ALTER TABLE "personas" DROP COLUMN "genero"`);
    }

}
