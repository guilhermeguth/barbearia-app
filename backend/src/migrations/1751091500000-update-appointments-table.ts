import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateAppointmentsTable1751091500000
  implements MigrationInterface {
  name = "UpdateAppointmentsTable1751091500000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Primeiro, vamos limpar todos os registros da tabela appointments
    // pois eles eram de teste e não têm os novos campos necessários
    await queryRunner.query(`DELETE FROM "appointments"`);

    // Agora podemos alterar a estrutura da tabela com segurança

    // Remove colunas antigas se existirem
    const appointmentDatetimeExists = await queryRunner.hasColumn(
      "appointments",
      "appointmentDatetime",
    );
    if (appointmentDatetimeExists) {
      await queryRunner.query(
        `ALTER TABLE "appointments" DROP COLUMN "appointmentDatetime"`,
      );
    }

    const oldCreatedAtExists = await queryRunner.hasColumn(
      "appointments",
      "createdAt",
    );
    if (oldCreatedAtExists) {
      await queryRunner.query(
        `ALTER TABLE "appointments" DROP COLUMN "createdAt"`,
      );
    }

    const oldUpdatedAtExists = await queryRunner.hasColumn(
      "appointments",
      "updatedAt",
    );
    if (oldUpdatedAtExists) {
      await queryRunner.query(
        `ALTER TABLE "appointments" DROP COLUMN "updatedAt"`,
      );
    }

    // Adiciona novas colunas
    const scheduledDateTimeExists = await queryRunner.hasColumn(
      "appointments",
      "scheduled_date_time",
    );
    if (!scheduledDateTimeExists) {
      await queryRunner.query(
        `ALTER TABLE "appointments" ADD "scheduled_date_time" TIMESTAMP NOT NULL`,
      );
    }

    const totalPriceExists = await queryRunner.hasColumn(
      "appointments",
      "total_price",
    );
    if (!totalPriceExists) {
      await queryRunner.query(
        `ALTER TABLE "appointments" ADD "total_price" numeric(10,2) NOT NULL`,
      );
    }

    const notesExists = await queryRunner.hasColumn("appointments", "notes");
    if (!notesExists) {
      await queryRunner.query(`ALTER TABLE "appointments" ADD "notes" text`);
    }

    const startedAtExists = await queryRunner.hasColumn(
      "appointments",
      "started_at",
    );
    if (!startedAtExists) {
      await queryRunner.query(
        `ALTER TABLE "appointments" ADD "started_at" TIMESTAMP`,
      );
    }

    const completedAtExists = await queryRunner.hasColumn(
      "appointments",
      "completed_at",
    );
    if (!completedAtExists) {
      await queryRunner.query(
        `ALTER TABLE "appointments" ADD "completed_at" TIMESTAMP`,
      );
    }

    const newCreatedAtExists = await queryRunner.hasColumn(
      "appointments",
      "created_at",
    );
    if (!newCreatedAtExists) {
      await queryRunner.query(
        `ALTER TABLE "appointments" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
      );
    }

    const newUpdatedAtExists = await queryRunner.hasColumn(
      "appointments",
      "updated_at",
    );
    if (!newUpdatedAtExists) {
      await queryRunner.query(
        `ALTER TABLE "appointments" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
      );
    }

    // Remove e recria as foreign keys
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP CONSTRAINT IF EXISTS "FK_2be3c78815aba227af1c3e8e413"`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP CONSTRAINT IF EXISTS "FK_28d5a251a0d69e60f83044f5a55"`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP CONSTRAINT IF EXISTS "FK_2a2088e8eaa8f28d8de2bdbb857"`,
    );

    // Garante que as colunas de FK são NOT NULL
    await queryRunner.query(
      `ALTER TABLE "appointments" ALTER COLUMN "customer_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" ALTER COLUMN "barber_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" ALTER COLUMN "service_id" SET NOT NULL`,
    );

    // Atualiza o enum de status
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP COLUMN IF EXISTS "status"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."appointments_status_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."appointments_status_enum" AS ENUM('scheduled', 'in_progress', 'completed', 'cancelled')`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" ADD "status" "public"."appointments_status_enum" NOT NULL DEFAULT 'scheduled'`,
    );

    // Recria as foreign keys
    await queryRunner.query(
      `ALTER TABLE "appointments" ADD CONSTRAINT "FK_2be3c78815aba227af1c3e8e413" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" ADD CONSTRAINT "FK_28d5a251a0d69e60f83044f5a55" FOREIGN KEY ("barber_id") REFERENCES "barbers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" ADD CONSTRAINT "FK_2a2088e8eaa8f28d8de2bdbb857" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback das alterações
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP CONSTRAINT "FK_2a2088e8eaa8f28d8de2bdbb857"`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP CONSTRAINT "FK_28d5a251a0d69e60f83044f5a55"`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP CONSTRAINT "FK_2be3c78815aba227af1c3e8e413"`,
    );
    await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "status"`);
    await queryRunner.query(`DROP TYPE "public"."appointments_status_enum"`);
    await queryRunner.query(
      `ALTER TABLE "appointments" ADD "status" character varying(20) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" ALTER COLUMN "service_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" ALTER COLUMN "barber_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" ALTER COLUMN "customer_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" ADD CONSTRAINT "FK_2a2088e8eaa8f28d8de2bdbb857" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" ADD CONSTRAINT "FK_28d5a251a0d69e60f83044f5a55" FOREIGN KEY ("barber_id") REFERENCES "barbers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" ADD CONSTRAINT "FK_2be3c78815aba227af1c3e8e413" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP COLUMN "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP COLUMN "completed_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP COLUMN "started_at"`,
    );
    await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "notes"`);
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP COLUMN "total_price"`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP COLUMN "scheduled_date_time"`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" ADD "appointmentDatetime" TIMESTAMP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
  }
}
