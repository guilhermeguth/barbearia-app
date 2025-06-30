import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddWorkingHoursToBarber1751154800000
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "barbers",
      new TableColumn({
        name: "workingHours",
        type: "json",
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("barbers", "workingHours");
  }
}
