import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDueDateAndDonationDateToPledges1756920000001 implements MigrationInterface {
    name = 'AddDueDateAndDonationDateToPledges1756920000001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pledges" ADD "dueDate" date`);
        await queryRunner.query(`ALTER TABLE "pledges" ADD "donationDate" date`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pledges" DROP COLUMN "donationDate"`);
        await queryRunner.query(`ALTER TABLE "pledges" DROP COLUMN "dueDate"`);
    }
}
