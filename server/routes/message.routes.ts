import { Router } from "express";
import {
  getAllMessages,
  sendMessage,
} from "../controllers/message.controllers";
import { sendMessageValidator } from "../validators/message.validators";
import { mongoIdPathVariableValidator } from "../validators/mongodb.validators";
import { validate } from "../validators/validate";
import { verifyJWT } from "../middlewares/auth.middlewares";

const router = Router();
router.use(verifyJWT);

router
  .route("/:chatId")
  .get(mongoIdPathVariableValidator("chatId"), validate, getAllMessages)
  .post(
    mongoIdPathVariableValidator("chatId"),
    sendMessageValidator(),
    validate,
    sendMessage
  );

export default router;
