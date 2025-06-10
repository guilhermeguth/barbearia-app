import { MigrationInterface, QueryRunner } from "typeorm";

export class Default1749517326188 implements MigrationInterface {
    name = 'Default1749517326188'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointments" ADD "updatedAt" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "updatedAt"`);
    }

}
