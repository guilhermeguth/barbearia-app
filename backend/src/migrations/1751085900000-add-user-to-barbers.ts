import { MigrationInterface, QueryRunner } from "typeorm";
import bcrypt from "bcrypt";

export class AddUserToBarbers1751085900000 implements MigrationInterface {
    name = 'AddUserToBarbers1751085900000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Adicionar coluna userId como nullable primeiro
        await queryRunner.query(`ALTER TABLE "barbers" ADD "userId" integer`);
        
        // 2. Buscar barbeiros existentes
        const barbers = await queryRunner.query(`SELECT * FROM "barbers"`);
        
        // 3. Para cada barbeiro, criar um usuário admin correspondente
        for (const barber of barbers) {
            // Criar senha padrão (deve ser alterada no primeiro login)
            const defaultPassword = await bcrypt.hash("123456", 10);
            
            // Criar usuário admin para o barbeiro
            const insertResult = await queryRunner.query(
                `INSERT INTO "users" ("name", "email", "password", "role", "createdAt") 
                 VALUES ($1, $2, $3, $4, $5) RETURNING "id"`,
                [barber.name, barber.email, defaultPassword, "admin", new Date()]
            );
            
            const userId = insertResult[0].id;
            
            // Atualizar barbeiro com o userId
            await queryRunner.query(
                `UPDATE "barbers" SET "userId" = $1 WHERE "id" = $2`,
                [userId, barber.id]
            );
        }
        
        // 4. Agora tornar a coluna NOT NULL e adicionar constraints
        await queryRunner.query(`ALTER TABLE "barbers" ALTER COLUMN "userId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "barbers" ADD CONSTRAINT "UQ_e06dd8ec5b263904f2b2c32e0dd" UNIQUE ("userId")`);
        await queryRunner.query(`ALTER TABLE "barbers" ADD CONSTRAINT "FK_e06dd8ec5b263904f2b2c32e0dd" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 1. Buscar userIds dos barbeiros para deletar os usuários correspondentes
        const barbers = await queryRunner.query(`SELECT "userId" FROM "barbers" WHERE "userId" IS NOT NULL`);
        
        // 2. Remover constraints
        await queryRunner.query(`ALTER TABLE "barbers" DROP CONSTRAINT "FK_e06dd8ec5b263904f2b2c32e0dd"`);
        await queryRunner.query(`ALTER TABLE "barbers" DROP CONSTRAINT "UQ_e06dd8ec5b263904f2b2c32e0dd"`);
        
        // 3. Remover coluna
        await queryRunner.query(`ALTER TABLE "barbers" DROP COLUMN "userId"`);
        
        // 4. Deletar usuários criados para os barbeiros (opcional, pode comentar se quiser manter)
        for (const barber of barbers) {
            await queryRunner.query(`DELETE FROM "users" WHERE "id" = $1`, [barber.userId]);
        }
    }
}
