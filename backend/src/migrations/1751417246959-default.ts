import { MigrationInterface, QueryRunner } from "typeorm";

export class Default1751417246959 implements MigrationInterface {
    name = 'Default1751417246959'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "phone" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "emailNotifications" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "users" ADD "smsNotifications" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "smsNotifications"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "emailNotifications"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "phone"`);
    }

}
