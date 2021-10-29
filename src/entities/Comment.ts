import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./User";
import { Post } from "./Post";

@ObjectType()
@Entity()
export class Comment extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  readonly id: number;

  @Field()
  @Column()
  text: string;

  @Field(() => Int)
  @Column()
  authorId: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.comments)
  author: User;

  @Field(() => Int)
  @Column()
  postId: number;

  @ManyToOne(() => Post, (post) => post.comments)
  post: Post;

  @Field()
  @CreateDateColumn({ type: "timestamptz" })
  createdDate: Date;

  @Field()
  @UpdateDateColumn({ type: "timestamptz" })
  updatedDate: Date;
}
