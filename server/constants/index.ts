export const UserRolesEnum = {
  ADMIN: "ADMIN",
  USER: "USER",
};

export const AvailableUserRoles = Object.values(UserRolesEnum);

export const DB_NAME = "QuickChat";
export const USER_TEMPORARY_TOKEN_EXPIRY = 20 * 60 * 1000;

export const ChatEventEnum = Object.freeze({
  CONNECTED_EVENT: "connected",
  DISCONNECT_EVENT: "disconnect",
  JOIN_CHAT_EVENT: "joinChat",
  LEAVE_CHAT_EVENT: "leaveChat",
  UPDATE_GROUP_NAME_EVENT: "updateGroupName",
  MESSAGE_RECEIVED_EVENT: "messageReceived",
  NEW_CHAT_EVENT: "newChat",
  SOCKET_ERROR_EVENT: "socketError",
  STOP_TYPING_EVENT: "stopTyping",
  TYPING_EVENT: "typing",
});

export const AvailableChatEvents = Object.values(ChatEventEnum);

export const ONE_ON_ONE_CHATS_COUNT = 100;
export const GROUP_CHATS_COUNT = 30;
export const GROUP_CHAT_MAX_PARTICIPANTS_COUNT = 10;
export const USERS_COUNT = 50;
