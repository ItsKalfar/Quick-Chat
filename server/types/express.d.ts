import { Request } from "express";
import { IUser } from "./models";
import multer from "multer";

export interface IAuthInfoRequest extends Request {
  user: IUser;
  file: multer.File;
  files: {
    attachments?: {
      filename: string;
      url: string;
      localPath: string;
      path?: string;
    }[];
  };
}

export interface MessageFile {
  url: string;
  localPath: string;
}
