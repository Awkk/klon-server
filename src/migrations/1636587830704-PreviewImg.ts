import {MigrationInterface, QueryRunner} from "typeorm";

export class PreviewImg1636587830704 implements MigrationInterface {
    name = 'PreviewImg1636587830704'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "vote" ("userId" integer NOT NULL, "postId" integer NOT NULL, "value" smallint NOT NULL, CONSTRAINT "PK_16e301aa5efdd994626b2635186" PRIMARY KEY ("userId", "postId"))`);
        await queryRunner.query(`CREATE TABLE "post" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "text" character varying, "link" character varying, "previewImg" character varying, "score" integer NOT NULL DEFAULT '0', "views" integer NOT NULL DEFAULT '0', "authorId" integer NOT NULL, "commentsCount" integer NOT NULL DEFAULT '0', "createdDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_be5fda3aac270b134ff9c21cdee" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "username" character varying NOT NULL, "password" character varying NOT NULL, "createdDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "comment" ("id" SERIAL NOT NULL, "text" character varying NOT NULL, "authorId" integer NOT NULL, "postId" integer NOT NULL, "createdDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_0b0e4bbc8415ec426f87f3a88e2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "vote" ADD CONSTRAINT "FK_f5de237a438d298031d11a57c3b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vote" ADD CONSTRAINT "FK_43cc1af57676ac1b7ec774bd10f" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post" ADD CONSTRAINT "FK_c6fb082a3114f35d0cc27c518e0" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_276779da446413a0d79598d4fbd" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_94a85bb16d24033a2afdd5df060" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_94a85bb16d24033a2afdd5df060"`);
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_276779da446413a0d79598d4fbd"`);
        await queryRunner.query(`ALTER TABLE "post" DROP CONSTRAINT "FK_c6fb082a3114f35d0cc27c518e0"`);
        await queryRunner.query(`ALTER TABLE "vote" DROP CONSTRAINT "FK_43cc1af57676ac1b7ec774bd10f"`);
        await queryRunner.query(`ALTER TABLE "vote" DROP CONSTRAINT "FK_f5de237a438d298031d11a57c3b"`);
        await queryRunner.query(`DROP TABLE "comment"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "post"`);
        await queryRunner.query(`DROP TABLE "vote"`);
    }

}
