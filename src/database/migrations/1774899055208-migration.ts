import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1774899055208 implements MigrationInterface {
    name = 'Migration1774899055208'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "personas" DROP CONSTRAINT "UQ_8fc56f72924ee1cf3181f8ea937"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "personas" ADD CONSTRAINT "UQ_8fc56f72924ee1cf3181f8ea937" UNIQUE ("documento")`);
    }

}
