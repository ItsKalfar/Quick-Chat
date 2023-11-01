import { Router } from "express";
import { UserRolesEnum } from "../constants";
import {
  assignRole,
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
} from "../controllers/user.controllers";
import { verifyJWT, verifyPermission } from "../middlewares/auth.middlewares";

import {
  userAssignRoleValidator,
  userLoginValidator,
  userRegisterValidator,
} from "../validators/user.validators";

import { validate } from "../validators/validate";
import { mongoIdPathVariableValidator } from "../validators/mongodb.validators";
const router = Router();

router.route("/register").post(userRegisterValidator(), validate, registerUser);
router.route("/login").post(userLoginValidator(), validate, loginUser);
router.route("/refresh-token").post(refreshAccessToken);

// Secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router
  .route("/assign-role/:userId")
  .post(
    verifyJWT,
    verifyPermission([UserRolesEnum.ADMIN]),
    mongoIdPathVariableValidator("userId"),
    userAssignRoleValidator(),
    validate,
    assignRole
  );

export default router;
