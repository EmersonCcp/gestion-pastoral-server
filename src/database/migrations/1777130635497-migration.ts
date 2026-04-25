import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1777130635497 implements MigrationInterface {
    name = 'Migration1777130635497'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "libros" ADD "imagen_url" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "libros" DROP COLUMN "imagen_url"`);
    }

}
