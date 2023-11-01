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
  sender: Pick<IUser, "_id" | "email" | "username">;
  content: string;
  chat: string;
  createdAt: string;
  updatedAt: string;
}
