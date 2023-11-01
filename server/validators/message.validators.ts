import { body } from "express-validator";

export const sendMessageValidator = () => {
  return [
    body("content")
      .trim()
      .optional()
      .notEmpty()
      .withMessage("Content is required"),
  ];
};
