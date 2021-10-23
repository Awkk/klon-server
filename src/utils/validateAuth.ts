import { FieldError } from "../resolvers/types/FieldError";
import { UserAuthInput } from "../resolvers/types/userAuthInput";

export const validateAuth = (auth: UserAuthInput): FieldError[] => {
  const error: FieldError[] = [];
  if (auth.username.length < 3) {
    error.push({
      field: "username",
      message: "Must be at least 3 characters long",
    });
  } else if (auth.username.length > 20) {
    error.push({
      field: "username",
      message: "Must be at most 20 characters long",
    });
  }

  if (auth.password.length < 3) {
    error.push({
      field: "password",
      message: "Must be at least 3 characters long",
    });
  } else if (auth.username.length > 128) {
    error.push({
      field: "password",
      message: "Must be at most 128 characters long",
    });
  }

  return error;
};
