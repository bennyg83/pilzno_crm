import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsAnnualPledgeToPledges1756920000000 implements MigrationInterface {
    name = 'AddIsAnnualPledgeToPledges1756920000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pledges" ADD "isAnnualPledge" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pledges" DROP COLUMN "isAnnualPledge"`);
    }
}
