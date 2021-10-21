import { Field, Int, ObjectType } from "type-graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { User } from "./User";
import { Vote } from "./Vote";

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

  @Field(()=>Int)
  @Column("int", { default: 0 })
  score: number;

  @Field()
  @Column("int", { default: 0 })
  views: string;

  @Field(()=>Int)
  @Column()
  authorId: number;

  @Field()
  @ManyToOne(() => User, (user) => user.posts)
  author: User;

  @OneToMany(() => Vote, (vote) => vote.post)
  votes: Vote[];

  @Field()
  @CreateDateColumn({ type: "timestamptz" })
  createdDate: Date;

  @Field()
  @UpdateDateColumn({ type: "timestamptz" })
  updatedDate: Date;
}
