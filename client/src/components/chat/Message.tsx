import { FC, useState } from "react";
import { Download, ZoomIn, Paperclip, X } from "lucide-react";
import moment from "moment";
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
          src={message.sender?.avatar?.url}
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

          {message.attachments.length > 0 && (
            <div
              className={`grid max-w-7xl gap-2 ${
                message.attachments?.length === 1 ? " grid-cols-1" : ""
              }${message.attachments?.length === 2 ? " grid-cols-2" : ""}${
                message.attachments?.length >= 3 ? " grid-cols-3" : ""
              }${message.content ? "mb-6" : ""}`}
            >
              {message.attachments?.map((file) => {
                return (
                  <div
                    key={file._id}
                    className="group relative aspect-square rounded overflow-hidden cursor-pointer"
                  >
                    <button
                      onClick={() => setReSizedImage(file.url)}
                      className="absolute inset-0 z-20 flex justify-center items-center w-full gap-2 h-full bg-black/60 group-hover:opacity-100 opacity-0 transition-opacity ease-in-out duration-150"
                    >
                      <ZoomIn className="h-6 w-6 text-white" />
                      <a
                        href={file.url}
                        download
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Download className="hover:text-zinc-400 h-6 w-6 text-white cursor-pointer" />
                      </a>
                    </button>
                    <img
                      className="h-full w-full object-cover"
                      src={file.url}
                      alt="msg_img"
                    />
                  </div>
                );
              })}
            </div>
          )}
          <div>
            {message.content && (
              <p className="break-words whitespace-normal">{message.content}</p>
            )}
          </div>

          <p className="mt-1.5 self-start text-[10px] inline-flex items-center text-zinc-400">
            {message.attachments?.length > 0 && (
              <Paperclip className="h-4 w-4 text-gray-400" />
            )}
            {moment(message.updatedAt).add("TIME_ZONE", "hours").fromNow(true)}{" "}
            ago
          </p>
        </div>
      </div>
    </>
  );
};
