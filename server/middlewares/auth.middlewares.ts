import { User } from "../models/user.model";
import { IAuthInfoRequest } from "../types/express";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { JwtPayload, verify } from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string
    );
    const user = await User.findById((decodedToken as JwtPayload)?._id).select(
      "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
    );
    if (!user) {
      throw new ApiError(401, "Invalid access token");
    }
    req.user = user;
    next();
  } catch (error: any) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});

/**
 *
 * @description Middleware to check logged in users for unprotected routes. The function will set the logged in user to the request object and, if no user is logged in, it will silently fail.
 */

export const getLoggedInUserOrIgnore = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  try {
    const decodedToken = verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string
    );
    const user = await User.findById((decodedToken as JwtPayload)?._id).select(
      "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
    );
    if (user) {
      req.user = user;
    }

    next();
  } catch (error) {
    // Fail silently with req.user being falsy
    next();
  }
});

export const verifyPermission = (roles: string[]) =>
  asyncHandler(async (req, res, next) => {
    const userId = (req as IAuthInfoRequest).user?._id;
    const userRole = (req as IAuthInfoRequest).user?.role;
    if (!userId) {
      throw new ApiError(401, "Unauthorized request");
    }
    if (userRole === undefined) {
      throw new ApiError(403, "User role is not defined");
    }
    if (roles.includes(userRole)) {
      next();
    } else {
      throw new ApiError(403, "You are not allowed to perform this action");
    }
  });
