import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeDocumentoNullable1774706405038 implements MigrationInterface {
    name = 'MakeDocumentoNullable1774706405038'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "personas" ALTER COLUMN "documento" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "personas" ALTER COLUMN "documento" SET NOT NULL`);
    }

}
