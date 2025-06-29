import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSettingsTable1735401000000 implements MigrationInterface {
    name = 'CreateSettingsTable1735401000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "settings" (
                "id" SERIAL NOT NULL,
                "key" varchar(100) NOT NULL,
                "value" text NOT NULL,
                "description" varchar(255),
                "isEncrypted" boolean NOT NULL DEFAULT false,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_settings_key" UNIQUE ("key"),
                CONSTRAINT "PK_settings_id" PRIMARY KEY ("id")
            )
        `);

        // Inserir configurações padrão
        await queryRunner.query(`
            INSERT INTO "settings" ("key", "value", "description") VALUES
            ('smtp_host', 'smtp.gmail.com', 'Servidor SMTP'),
            ('smtp_port', '587', 'Porta SMTP'),
            ('smtp_secure', 'false', 'SSL/TLS ativo')
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "settings"`);
    }
}
