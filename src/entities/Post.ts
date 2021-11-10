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
import { Comment } from "./Comment";

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

  @Field({ nullable: true })
  @Column({ nullable: true })
  link: string;

  @Field(() => Int)
  @Column("int", { default: 0 })
  score: number;

  @Field(() => Int)
  @Column("int", { default: 0 })
  views: number;

  @Field(() => Int)
  @Column()
  authorId: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.posts)
  author: User;

  @OneToMany(() => Vote, (vote) => vote.post)
  votes: Vote[];

  @Field(() => Int)
  voteStatus: number;

  @Field(() => [Comment])
  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @Field(() => Int)
  @Column("int", { default: 0 })
  commentsCount: number;

  @Field()
  @CreateDateColumn({ type: "timestamptz" })
  createdDate: Date;

  @Field()
  @UpdateDateColumn({ type: "timestamptz" })
  updatedDate: Date;
}
