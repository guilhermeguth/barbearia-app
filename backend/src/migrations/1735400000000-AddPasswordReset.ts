import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPasswordReset1735400000000 implements MigrationInterface {
    name = 'AddPasswordReset1735400000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users" 
            ADD COLUMN "resetPasswordToken" varchar(255),
            ADD COLUMN "resetPasswordExpires" timestamp
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users" 
            DROP COLUMN "resetPasswordToken",
            DROP COLUMN "resetPasswordExpires"
        `);
    }
}
