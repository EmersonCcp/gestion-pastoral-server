import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1774699926255 implements MigrationInterface {
    name = 'Migration1774699926255'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "permisos" ("id" SERIAL NOT NULL, "accion" character varying NOT NULL, "sujeto" character varying NOT NULL, "descripcion" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_d976db7de47f6f0acb91eb5f318" UNIQUE ("sujeto", "accion"), CONSTRAINT "PK_3127bd9cfeb13ae76186d0d9b38" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "roles_permisos" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "rol_id" integer, "permiso_id" integer, CONSTRAINT "UQ_0e1dbe0449ae37ef1b31b0d9474" UNIQUE ("rol_id", "permiso_id"), CONSTRAINT "PK_558aeeacf6cfc38b06944ab4038" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "roles" ("id" SERIAL NOT NULL, "nombre" character varying NOT NULL, "descripcion" character varying, "estado" bit NOT NULL DEFAULT '1', "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_a5be7aa67e759e347b1c6464e10" UNIQUE ("nombre"), CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "usuarios_roles" ("id" SERIAL NOT NULL, "assigned_at" TIMESTAMP NOT NULL DEFAULT now(), "expires_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "usuario_id" integer NOT NULL, "rol_id" integer NOT NULL, CONSTRAINT "PK_28de221731be7761ba1b165df08" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_1213eb778bfb72e49cdf8a25da" ON "usuarios_roles" ("usuario_id", "rol_id") `);
        await queryRunner.query(`CREATE TABLE "usuarios" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "password_encrypted" character varying NOT NULL, "nombre_completo" character varying NOT NULL, "is_super_user" bit NOT NULL DEFAULT '1', "estado" bit NOT NULL DEFAULT '1', CONSTRAINT "UQ_446adfc18b35418aac32ae0b7b5" UNIQUE ("email"), CONSTRAINT "PK_d7281c63c176e152e4c531594a8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "usuarios_sesiones" ("id" SERIAL NOT NULL, "token" character varying NOT NULL, "tipo" character varying NOT NULL, "estado" bit NOT NULL DEFAULT '1', "ip_address" character varying, "user_agent" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "expires_at" TIMESTAMP, "revoked_at" TIMESTAMP, "usuario_id" integer, CONSTRAINT "UQ_7ccf3475489913142ad3ed2b509" UNIQUE ("token"), CONSTRAINT "PK_6a919d5c1dc383304dc9d2cd234" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "roles_permisos" ADD CONSTRAINT "FK_dc3cfbcce511233d4bef92d7e3b" FOREIGN KEY ("rol_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "roles_permisos" ADD CONSTRAINT "FK_ef10d9983fcb45f0024cc7000d3" FOREIGN KEY ("permiso_id") REFERENCES "permisos"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "usuarios_roles" ADD CONSTRAINT "FK_2c14b9e5e2d0cf077fa4dd33502" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "usuarios_roles" ADD CONSTRAINT "FK_425dfd009aeeee0c08af9a67a37" FOREIGN KEY ("rol_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "usuarios_sesiones" ADD CONSTRAINT "FK_b0de2dfbd0456fc760398281442" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "usuarios_sesiones" DROP CONSTRAINT "FK_b0de2dfbd0456fc760398281442"`);
        await queryRunner.query(`ALTER TABLE "usuarios_roles" DROP CONSTRAINT "FK_425dfd009aeeee0c08af9a67a37"`);
        await queryRunner.query(`ALTER TABLE "usuarios_roles" DROP CONSTRAINT "FK_2c14b9e5e2d0cf077fa4dd33502"`);
        await queryRunner.query(`ALTER TABLE "roles_permisos" DROP CONSTRAINT "FK_ef10d9983fcb45f0024cc7000d3"`);
        await queryRunner.query(`ALTER TABLE "roles_permisos" DROP CONSTRAINT "FK_dc3cfbcce511233d4bef92d7e3b"`);
        await queryRunner.query(`DROP TABLE "usuarios_sesiones"`);
        await queryRunner.query(`DROP TABLE "usuarios"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1213eb778bfb72e49cdf8a25da"`);
        await queryRunner.query(`DROP TABLE "usuarios_roles"`);
        await queryRunner.query(`DROP TABLE "roles"`);
        await queryRunner.query(`DROP TABLE "roles_permisos"`);
        await queryRunner.query(`DROP TABLE "permisos"`);
    }

}
