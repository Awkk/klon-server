import { passwordLength, usernameLength } from "../constants";
import { FieldError } from "../resolvers/types/fieldError";
import { UserAuthInput } from "../resolvers/types/userAuthInput";

export const validateAuth = (auth: UserAuthInput): FieldError[] => {
  const error: FieldError[] = [];
  if (auth.username.length < usernameLength.minLength) {
    error.push({
      field: "username",
      message: `Must be at least ${usernameLength.minLength} characters long`,
    });
  } else if (auth.username.length > usernameLength.maxLength) {
    error.push({
      field: "username",
      message: `Must be at most ${usernameLength.maxLength} characters long`,
    });
  }

  if (auth.password.length < passwordLength.minLength) {
    error.push({
      field: "password",
      message: `Must be at least ${passwordLength.minLength} characters long`,
    });
  } else if (auth.username.length > passwordLength.minLength) {
    error.push({
      field: "password",
      message: `Must be at most ${passwordLength.minLength} characters long`,
    });
  }

  return error;
};
