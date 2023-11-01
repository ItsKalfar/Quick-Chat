import { Request, Response, NextFunction } from "express";
import { IAuthInfoRequest } from "../types/express";

const asyncHandler = (
  requestHandler: (
    req: Request | IAuthInfoRequest,
    res: Response,
    next: NextFunction
  ) => Promise<any>
) => {
  return (
    req: Request | IAuthInfoRequest,
    res: Response,
    next: NextFunction
  ) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };
