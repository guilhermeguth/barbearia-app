import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPhotoToBarbers1751114306565 implements MigrationInterface {
    name = 'AddPhotoToBarbers1751114306565'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "barbers" ADD "photoUrl" character varying(500)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "barbers" DROP COLUMN "photoUrl"`);
    }

}
