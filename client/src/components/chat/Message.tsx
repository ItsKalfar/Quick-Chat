import { FC, useState } from "react";
import { X } from "lucide-react";
import moment from "moment";
import UserImage from "./../../assets/images/user.png";

export const MessageItem: FC<{
  isOwnMessage?: boolean;
  isGroupChatMessage?: boolean;
  message: IChatMessage;
}> = ({ isGroupChatMessage, isOwnMessage, message }) => {
  const [resizedImage, setReSizedImage] = useState<null | string>(null);
  return (
    <>
      {resizedImage && (
        <div className="h-full  z-40 overflow-hidden w-full absolute inset-0 bg-black/70 flex justify-center items-center">
          <X
            className="absolute top-5 right-5 h-9 text-white cursor-pointer"
            onClick={() => setReSizedImage(null)}
          />
          <img
            className="w-full h-full object-contain"
            src={resizedImage}
            alt="Chat Image"
          />
        </div>
      )}
      <div
        className={`flex justify-start bg-gray-800 text-white items-center gap-3 rounded p-3  max-w-lg ${
          isOwnMessage && "ml-auto"
        }`}
      >
        <img
          src={UserImage}
          className={`h-8 w-8 object-cover rounded-full flex flex-shrink-0 ${
            isOwnMessage ? "order-2" : "order-1"
          }`}
        />
        <div
          className={`flex flex-col max-w-md ${
            isOwnMessage ? "order-1 rounded-br-none" : "order-2 rounded-bl-none"
          }`}
        >
          {isGroupChatMessage && !isOwnMessage && (
            <p className="text-sm font-semibold mb-2">
              {message.sender.username.length % 2}
            </p>
          )}
          <div>
            {message.content && (
              <p className="break-words whitespace-normal">{message.content}</p>
            )}
          </div>

          <p className="mt-1.5 self-start text-[10px] inline-flex items-center text-zinc-400">
            {moment(message.updatedAt).add("TIME_ZONE", "hours").fromNow(true)}{" "}
            ago
          </p>
        </div>
      </div>
    </>
  );
};
