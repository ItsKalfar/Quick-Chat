interface IChatListItem {
  admin: string;
  createdAt: string;
  isGroupChat: true;
  lastMessage?: IChatMessage;
  name: string;
  participants: IUser[];
  updatedAt: string;
  _id: string;
}

interface IChatMessage {
  _id: string;
  sender: Pick<IUser, "_id" | "avatar" | "email" | "username">;
  content: string;
  chat: string;
  attachments: {
    url: string;
    localPath: string;
    _id: string;
  }[];
  createdAt: string;
  updatedAt: string;
}
