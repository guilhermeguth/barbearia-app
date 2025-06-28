import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPhotoToUsers1751121000000 implements MigrationInterface {
    name = 'AddPhotoToUsers1751121000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "photoUrl" character varying(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "photoUrl"`);
    }
}
