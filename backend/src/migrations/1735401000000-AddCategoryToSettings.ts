import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCategoryToSettings1735401000000 implements MigrationInterface {
    name = 'AddCategoryToSettings1735401000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "settings" 
            ADD COLUMN "category" varchar(50) DEFAULT 'system'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "settings" 
            DROP COLUMN "category"
        `);
    }
}
