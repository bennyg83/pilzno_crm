import { MigrationInterface, QueryRunner } from "typeorm";

export class RemovePledgedByFromPledges1756920000002 implements MigrationInterface {
    name = 'RemovePledgedByFromPledges1756920000002'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pledges" DROP COLUMN "pledgedBy"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pledges" ADD "pledgedBy" character varying`);
    }
}
