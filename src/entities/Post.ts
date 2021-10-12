import { Field, Int, ObjectType } from "type-graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from "typeorm";
import { User } from "./User";

@ObjectType()
@Entity()
export class Post extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  readonly id: number;

  @Field()
  @Column()
  title: string;

  @Field()
  @Column()
  text: string;

  @Field()
  @Column("int", { default: 0 })
  score: number;

  @Field()
  @Column("int", { default: 0 })
  views: string;

  @Field()
  @Column()
  authorId: number;

  @ManyToOne(() => User, (user) => user.posts)
  author: User;

  @Field()
  @CreateDateColumn()
  createdDate: Date;

  @Field()
  @UpdateDateColumn()
  updatedDate: Date;
}
