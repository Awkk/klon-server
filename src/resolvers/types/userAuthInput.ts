import { Field, InputType } from "type-graphql";

@InputType()
export class UserAuthInput {
  @Field()
  username: string;
  @Field()
  password: string;
}
