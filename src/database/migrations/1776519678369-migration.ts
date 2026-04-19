import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1776519678369 implements MigrationInterface {
    name = 'Migration1776519678369'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."libros_asignaciones_tipo_enum" AS ENUM('VENTA', 'PRESTAMO')`);
        await queryRunner.query(`CREATE TYPE "public"."libros_asignaciones_estado_enum" AS ENUM('ENTREGADO', 'DEVUELTO', 'PERDIDO')`);
        await queryRunner.query(`CREATE TABLE "libros_asignaciones" ("id" SERIAL NOT NULL, "libro_id" integer NOT NULL, "persona_id" integer NOT NULL, "tipo" "public"."libros_asignaciones_tipo_enum" NOT NULL, "estado" "public"."libros_asignaciones_estado_enum" NOT NULL DEFAULT 'ENTREGADO', "fecha_entrega" date NOT NULL, "fecha_devolucion_esperada" date, "fecha_devolucion_real" date, "observaciones" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_59cfb183968c19cffafbc42f1c4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."libros_movimientos_tipo_enum" AS ENUM('INGRESO', 'EGRESO')`);
        await queryRunner.query(`CREATE TYPE "public"."libros_movimientos_motivo_enum" AS ENUM('COMPRA', 'DONACION', 'DEVOLUCION_PRESTAMO', 'BAJA_PERDIDA', 'BAJA_DANIADO', 'TRANSFERENCIA', 'ENTREGA_PERSONA', 'AJUSTE_MANUAL')`);
        await queryRunner.query(`CREATE TABLE "libros_movimientos" ("id" SERIAL NOT NULL, "libro_id" integer NOT NULL, "tipo" "public"."libros_movimientos_tipo_enum" NOT NULL, "motivo" "public"."libros_movimientos_motivo_enum" NOT NULL, "cantidad" integer NOT NULL, "fecha" date NOT NULL, "observaciones" text, "persona_id" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3b01dd10b54d397d368e3d0d70e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "libros" ADD "stock_actual" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "libros_asignaciones" ADD CONSTRAINT "FK_d1749c89b167afa1658beccb22d" FOREIGN KEY ("libro_id") REFERENCES "libros"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "libros_asignaciones" ADD CONSTRAINT "FK_592fb031c1fc4618c87c4f416b1" FOREIGN KEY ("persona_id") REFERENCES "personas"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "libros_movimientos" ADD CONSTRAINT "FK_ae091a249b6a1aa05150b9d9ca6" FOREIGN KEY ("libro_id") REFERENCES "libros"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "libros_movimientos" ADD CONSTRAINT "FK_0e9af6f13e15f970452fc6bb8b9" FOREIGN KEY ("persona_id") REFERENCES "personas"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "libros_movimientos" DROP CONSTRAINT "FK_0e9af6f13e15f970452fc6bb8b9"`);
        await queryRunner.query(`ALTER TABLE "libros_movimientos" DROP CONSTRAINT "FK_ae091a249b6a1aa05150b9d9ca6"`);
        await queryRunner.query(`ALTER TABLE "libros_asignaciones" DROP CONSTRAINT "FK_592fb031c1fc4618c87c4f416b1"`);
        await queryRunner.query(`ALTER TABLE "libros_asignaciones" DROP CONSTRAINT "FK_d1749c89b167afa1658beccb22d"`);
        await queryRunner.query(`ALTER TABLE "libros" DROP COLUMN "stock_actual"`);
        await queryRunner.query(`DROP TABLE "libros_movimientos"`);
        await queryRunner.query(`DROP TYPE "public"."libros_movimientos_motivo_enum"`);
        await queryRunner.query(`DROP TYPE "public"."libros_movimientos_tipo_enum"`);
        await queryRunner.query(`DROP TABLE "libros_asignaciones"`);
        await queryRunner.query(`DROP TYPE "public"."libros_asignaciones_estado_enum"`);
        await queryRunner.query(`DROP TYPE "public"."libros_asignaciones_tipo_enum"`);
    }

}
