import { User } from "../../entities/User";
import { Field, ObjectType } from "type-graphql";
import { FieldError } from "./fieldError";

@ObjectType()
export class UserResponse {
  @Field({ nullable: true })
  user?: User;

  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
}
