import {MigrationInterface, QueryRunner} from "typeorm";

export class LinkAndPreviewImg1636588786367 implements MigrationInterface {
    name = 'LinkAndPreviewImg1636588786367'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post" ADD "link" character varying`);
        await queryRunner.query(`ALTER TABLE "post" ADD "previewImg" character varying`);
        await queryRunner.query(`ALTER TABLE "post" ALTER COLUMN "text" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post" ALTER COLUMN "text" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "post" DROP COLUMN "previewImg"`);
        await queryRunner.query(`ALTER TABLE "post" DROP COLUMN "link"`);
    }

}
