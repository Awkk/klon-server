import { FieldError } from "../resolvers/types/FieldError";
import { UserAuthInput } from "../resolvers/types/userAuthInput";

export const validateAuth = (auth: UserAuthInput): FieldError[] => {
  const error: FieldError[] = [];
  if (auth.username.length < 3) {
    error.push({
      field: "username",
      message: "username must be at least 3 characters long",
    });
  }

  if (auth.password.length < 3) {
    error.push({
      field: "password",
      message: "password must be at least 3 characters long",
    });
  }

  return error;
};
