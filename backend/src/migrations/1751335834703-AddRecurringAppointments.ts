import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRecurringAppointments1751335834703 implements MigrationInterface {
    name = 'AddRecurringAppointments1751335834703'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "settings" DROP COLUMN "category"`);
        await queryRunner.query(`CREATE TYPE "public"."appointments_recurrence_type_enum" AS ENUM('none', 'weekly', 'biweekly', 'monthly')`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "recurrence_type" "public"."appointments_recurrence_type_enum" NOT NULL DEFAULT 'none'`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "recurrence_end_date" date`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "parent_appointment_id" integer`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "is_recurring_parent" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "is_recurring_parent"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "parent_appointment_id"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "recurrence_end_date"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "recurrence_type"`);
        await queryRunner.query(`DROP TYPE "public"."appointments_recurrence_type_enum"`);
        await queryRunner.query(`ALTER TABLE "settings" ADD "category" character varying(50) DEFAULT 'system'`);
    }

}
