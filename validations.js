import { body } from "express-validator";

export const loginValidation = [
  body("email", "email format error").isEmail(),
  body("password", "password must contain at least 5 symbols").isLength({
    min: 5,
  }),
];

export const registerValidation = [
  body("email", "email format error").isEmail(),
  body("password", "password must contain at least 5 symbols").isLength({
    min: 5,
  }),
  body("fullName", "enter name").isLength({ min: 5 }),
  body("avatarUrl", "error avatar url").optional().isURL(),
];

export const postCreateValidation = [
  body("title", "enter post header").isLength({ min: 3 }).isString(),
  body("text", "enter post body").isLength({ min: 10 }).isString(),
  body("tags", "error tag format").optional().isArray(),
  body("imageUrl", "error image url").optional().isString(),
];
