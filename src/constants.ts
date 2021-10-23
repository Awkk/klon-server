export const __prod__ = process.env.NODE_ENV === "production";
export const COOKIE_NAME = "sid";
export const usernameLength = { minLength: 3, maxLength: 20 };
export const passwordLength = { minLength: 6, maxLength: 128 };
