import { Paperclip, MoreVertical, Trash, Info } from "lucide-react";
import moment from "moment";
import { useState } from "react";
import { deleteOneOnOneChat } from "../../assets/api";
import { useAuth } from "../../context/AuthContext";
import { requestHandler } from "../../utils/RequestHandler";
import { getChatObjectMetadata } from "../../utils/ChatMetadata";
import { GroupChatDetails } from "./GroupChatDetails";

export const ChatItem: React.FC<{
  chat: IChatListItem;
  onClick: (chat: IChatListItem) => void;
  isActive?: boolean;
  unreadCount?: number;
  onChatDelete: (chatId: string) => void;
}> = ({ chat, onClick, isActive, unreadCount = 0, onChatDelete }) => {
  const { user } = useAuth();
  const [openOptions, setOpenOptions] = useState(false);
  const [openGroupInfo, setOpenGroupInfo] = useState(false);

  // Define an asynchronous function named 'deleteChat'.
  const deleteChat = async () => {
    await requestHandler(
      //  A callback function that performs the deletion of a one-on-one chat by its ID.
      async () => await deleteOneOnOneChat(chat._id),
      null,
      // A callback function to be executed on success. It will call 'onChatDelete'
      // function with the chat's ID as its parameter.
      () => {
        onChatDelete(chat._id);
      },
      alert
    );
  };

  if (!chat) return;

  return (
    <>
      <GroupChatDetails
        open={openGroupInfo}
        chatId={chat._id}
        onGroupDelete={onChatDelete}
        onClose={() => setOpenGroupInfo(!openGroupInfo)}
      />
      <div
        role="button"
        onClick={() => onClick(chat)}
        onMouseLeave={() => setOpenOptions(false)}
        className={`group py-4 px-2 gap-3 flex justify-between items-start cursor-pointer  border-b border-gray-700 text-white ${
          isActive ? "bg-gray-800" : ""
        }${
          unreadCount > 0
            ? "border-[1px] border-success bg-success/20 font-bold"
            : ""
        }`}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setOpenOptions(!openOptions);
          }}
          className="self-center p-1 relative"
        >
          <MoreVertical className="h-6 group-hover:w-6 group-hover:opacity-100 w-0 opacity-0 transition-all ease-in-out duration-100 text-gray-100" />
          <div
            className={`z-20 text-left absolute bottom-0 translate-y-full text-sm w-52 bg-gray-700 rounded-md p-2 shadow-md ${
              openOptions ? "block" : "hidden"
            }`}
          >
            {chat.isGroupChat ? (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenGroupInfo(true);
                }}
                className="p-2 w-full bg-gray-700 inline-flex items-center"
              >
                <Info className="h-4 w-4 mr-2" /> About group
              </div>
            ) : (
              <p
                onClick={(e) => {
                  e.stopPropagation();
                  const ok = confirm(
                    "Are you sure you want to delete this chat?"
                  );
                  if (ok) {
                    deleteChat();
                  }
                }}
                role="button"
                className="p-2 text-red-600 font-medium rounded w-full inline-flex items-center"
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete chat
              </p>
            )}
          </div>
        </button>
        <div className="flex justify-center items-center flex-shrink-0">
          {chat.isGroupChat ? (
            <div className="w-12 relative h-12 flex-shrink-0 flex justify-start items-center flex-nowrap">
              {chat.participants.slice(0, 3).map((participant, i) => {
                return (
                  <img
                    key={participant._id}
                    src={participant.avatar.url}
                    className={`w-8 h-8 border-[1px] border-gray-800 rounded-full absolute outline outline-2  group-hover:outline-secondary ${
                      i === 0
                        ? "left-0 z-[3]"
                        : i === 1
                        ? "left-2.5 z-[2]"
                        : i === 2
                        ? "left-[18px] z-[1]"
                        : ""
                    }  ${isActive ? "outline-gray-800" : "outline-gray-900"}`}
                  />
                );
              })}
            </div>
          ) : (
            <img
              src={getChatObjectMetadata(chat, user!).avatar}
              className="w-12 h-12 rounded-full"
            />
          )}
        </div>
        <div className="w-full">
          <p className="truncate-1 font-semibold">
            {getChatObjectMetadata(chat, user!).title}
          </p>
          <div className="w-full inline-flex items-center text-left">
            {chat.lastMessage && chat.lastMessage.attachments.length > 0 ? (
              // If last message is an attachment show paperclip
              <Paperclip className="text-white h-3 w-3 mr-2 flex flex-shrink-0" />
            ) : null}
            <small className="text-white truncate-1 text-sm text-ellipsis inline-flex items-center">
              {getChatObjectMetadata(chat, user!).lastMessage.slice(0, 30)}
            </small>
          </div>
        </div>
        <div className="flex text-white h-full text-sm flex-col justify-between items-end">
          <small className="mb-2 inline-flex flex-shrink-0 w-max">
            {moment(chat.updatedAt).add("TIME_ZONE", "hours").fromNow(true)}
          </small>

          {/* Unread count will be > 0 when user is on another chat and there is new message in a chat which is not currently active on user's screen */}
          {unreadCount <= 0 ? null : (
            <span className="bg-success h-2 w-2 aspect-square flex-shrink-0 p-2 text-white text-xs rounded-full inline-flex justify-center items-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </div>
      </div>
    </>
  );
};
