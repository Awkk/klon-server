import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import argon2 from "argon2";
import { User } from "../entities/User";
import { getConnection } from "typeorm";
import { UserAuthInput } from "./types/userAuthInput";
import { UserResponse } from "./types/userResponse";
import { isQueryFailedError } from "./types/errorTypeCheck";
import { MyContext } from "../types/expressContext";
import { validateAuth } from "../utils/validateAuth";

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  async me(@Ctx() { req }: MyContext) {
    if (!req.session.userId) {
      return null;
    }
    return await User.findOne(req.session.userId);
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("auth") auth: UserAuthInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    let user;
    try {
      const validationError = validateAuth(auth);
      if (validationError.length > 0) {
        return { errors: validationError };
      }

      const hashedPw = await argon2.hash(auth.password);
      const result = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({ username: auth.username, password: hashedPw })
        .returning("*")
        .execute();
      user = result.raw[0];
    } catch (err: unknown) {
      if (isQueryFailedError(err)) {
        // unique username violation
        if (err.code === "23505") {
          return {
            errors: [{ field: "username", message: "username already taken" }],
          };
        }
      }
    }
    // create login session and send cookie
    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("auth") auth: UserAuthInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const user = await User.findOne({ where: { username: auth.username } });
    if (!user) {
      return { errors: [{ field: "username", message: "user not exist" }] };
    }

    const validPw = await argon2.verify(user.password, auth.password);
    if (!validPw) {
      return { errors: [{ field: "password", message: "incorrect password" }] };
    }
    // create login session and send cookie
    req.session.userId = user.id;

    return { user };
  }
}
