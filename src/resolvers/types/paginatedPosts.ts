import { Post } from "../../entities/Post";
import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];
  @Field()
  hasMore: boolean;
}
