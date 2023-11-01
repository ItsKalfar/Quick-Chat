import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getChatMessages, getUserChats, sendMessage } from "../assets/api";
import { AddChat } from "../components/chat/AddChat";
import { ChatItem } from "../components/chat/ChatListItem";
import { MessageItem } from "../components/chat/Message";
import { Typing } from "../components/chat/TypingIndicator";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { LocalStorage } from "../utils/LocalStorage";
import { requestHandler } from "../utils/RequestHandler";
import { getChatObjectMetadata } from "../utils/ChatMetadata";
import { Button } from "../components/Button";
import UserImage from "../assets/images/user.png";

const CONNECTED_EVENT = "connected";
const DISCONNECT_EVENT = "disconnect";
const JOIN_CHAT_EVENT = "joinChat";
const NEW_CHAT_EVENT = "newChat";
const TYPING_EVENT = "typing";
const STOP_TYPING_EVENT = "stopTyping";
const MESSAGE_RECEIVED_EVENT = "messageReceived";
const LEAVE_CHAT_EVENT = "leaveChat";
const UPDATE_GROUP_NAME_EVENT = "updateGroupName";

export const ChatPage = () => {
  const { user, logout } = useAuth();
  const { socket } = useSocket();

  // Create a reference using 'useRef' to hold the currently selected chat.
  // 'useRef' is used here because it ensures that the 'currentChat' value within socket event callbacks
  // will always refer to the latest value, even if the component re-renders.
  const currentChat = useRef<IChatListItem | null>(null);

  // To keep track of the setTimeout function
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Define state variables and their initial values using 'useState'
  const [isConnected, setIsConnected] = useState(false); // For tracking socket connection

  const [openAddChat, setOpenAddChat] = useState(false); // To control the 'Add Chat' modal
  const [loadingChats, setLoadingChats] = useState(false); // To indicate loading of chats
  const [loadingMessages, setLoadingMessages] = useState(false); // To indicate loading of messages

  const [chats, setChats] = useState<IChatListItem[]>([]); // To store user's chats
  const [messages, setMessages] = useState<IChatMessage[]>([]); // To store chat messages
  const [unreadMessages, setUnreadMessages] = useState<IChatMessage[]>([]); // To track unread messages

  const [isTyping, setIsTyping] = useState(false); // To track if someone is currently typing
  const [selfTyping, setSelfTyping] = useState(false); // To track if the current user is typing

  const [message, setMessage] = useState(""); // To store the currently typed message
  const [localSearchQuery, setLocalSearchQuery] = useState(""); // For local search functionality

  /**
   *  A  function to update the last message of a specified chat to update the chat list
   */
  const updateChatLastMessage = (
    chatToUpdateId: string,
    message: IChatMessage // The new message to be set as the last message
  ) => {
    // Search for the chat with the given ID in the chats array
    const chatToUpdate = chats.find((chat) => chat._id === chatToUpdateId)!;

    // Update the 'lastMessage' field of the found chat with the new message
    chatToUpdate.lastMessage = message;

    // Update the 'updatedAt' field of the chat with the 'updatedAt' field from the message
    chatToUpdate.updatedAt = message?.updatedAt;

    // Update the state of chats, placing the updated chat at the beginning of the array
    setChats([
      chatToUpdate, // Place the updated chat first
      ...chats.filter((chat) => chat._id !== chatToUpdateId), // Include all other chats except the updated one
    ]);
  };

  const getChats = async () => {
    requestHandler(
      async () => await getUserChats(),
      setLoadingChats,
      (res) => {
        const { data } = res;
        setChats(data || []);
      },
      alert
    );
  };

  const getMessages = async () => {
    // Check if a chat is selected, if not, show an alert
    if (!currentChat.current?._id) return alert("No chat is selected");

    // Check if socket is available, if not, show an alert
    if (!socket) return alert("Socket not available");

    // Emit an event to join the current chat
    socket.emit(JOIN_CHAT_EVENT, currentChat.current?._id);

    // Filter out unread messages from the current chat as those will be read
    setUnreadMessages(
      unreadMessages.filter((msg) => msg.chat !== currentChat.current?._id)
    );

    // Make an async request to fetch chat messages for the current chat
    requestHandler(
      // Fetching messages for the current chat
      async () => await getChatMessages(currentChat.current?._id || ""),
      // Set the state to loading while fetching the messages
      setLoadingMessages,
      // After fetching, set the chat messages to the state if available
      (res) => {
        const { data } = res;
        setMessages(data || []);
      },
      alert
    );
  };

  // Function to send a chat message
  const sendChatMessage = async () => {
    // If no current chat ID exists or there's no socket connection, exit the function
    if (!currentChat.current?._id || !socket) return;

    // Emit a STOP_TYPING_EVENT to inform other users/participants that typing has stopped
    socket.emit(STOP_TYPING_EVENT, currentChat.current?._id);

    // Use the requestHandler to send the message and handle potential response or error
    await requestHandler(
      // Try to send the chat message with the given message and attached files
      async () =>
        await sendMessage(
          currentChat.current?._id || "", // Chat ID or empty string if not available
          message // Actual text message
        ),
      null,
      // On successful message sending, clear the message input and attached files, then update the UI
      (res) => {
        setMessage(""); // Clear the message input
        setMessages((prev) => [res.data, ...prev]); // Update messages in the UI
        updateChatLastMessage(currentChat.current?._id || "", res.data); // Update the last message in the chat
      },
      alert
    );
  };

  const handleOnMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);

    // If socket doesn't exist or isn't connected, exit the function
    if (!socket || !isConnected) return;

    // Check if the user isn't already set as typing
    if (!selfTyping) {
      // Set the user as typing
      setSelfTyping(true);

      // Emit a typing event to the server for the current chat
      socket.emit(TYPING_EVENT, currentChat.current?._id);
    }

    // Clear the previous timeout (if exists) to avoid multiple setTimeouts from running
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Define a length of time (in milliseconds) for the typing timeout
    const timerLength = 3000;

    // Set a timeout to stop the typing indication after the timerLength has passed
    typingTimeoutRef.current = setTimeout(() => {
      // Emit a stop typing event to the server for the current chat
      socket.emit(STOP_TYPING_EVENT, currentChat.current?._id);

      // Reset the user's typing state
      setSelfTyping(false);
    }, timerLength);
  };

  const onConnect = () => {
    setIsConnected(true);
  };

  const onDisconnect = () => {
    setIsConnected(false);
  };

  /**
   * Handles the "typing" event on the socket.
   */
  const handleOnSocketTyping = (chatId: string) => {
    // Check if the typing event is for the currently active chat.
    if (chatId !== currentChat.current?._id) return;

    // Set the typing state to true for the current chat.
    setIsTyping(true);
  };

  /**
   * Handles the "stop typing" event on the socket.
   */
  const handleOnSocketStopTyping = (chatId: string) => {
    // Check if the stop typing event is for the currently active chat.
    if (chatId !== currentChat.current?._id) return;

    // Set the typing state to false for the current chat.
    setIsTyping(false);
  };

  /**
   * Handles the event when a new message is received.
   */
  const onMessageReceived = (message: IChatMessage) => {
    // Check if the received message belongs to the currently active chat
    if (message?.chat !== currentChat.current?._id) {
      // If not, update the list of unread messages
      setUnreadMessages((prev) => [message, ...prev]);
    } else {
      // If it belongs to the current chat, update the messages list for the active chat
      setMessages((prev) => [message, ...prev]);
    }

    // Update the last message for the chat to which the received message belongs
    updateChatLastMessage(message.chat || "", message);
  };

  const onNewChat = (chat: IChatListItem) => {
    setChats((prev) => [chat, ...prev]);
  };

  // This function handles the event when a user leaves a chat.
  const onChatLeave = (chat: IChatListItem) => {
    // Check if the chat the user is leaving is the current active chat.
    if (chat._id === currentChat.current?._id) {
      // If the user is in the group chat they're leaving, close the chat window.
      currentChat.current = null;
      // Remove the currentChat from local storage.
      LocalStorage.remove("currentChat");
    }
    // Update the chats by removing the chat that the user left.
    setChats((prev) => prev.filter((c) => c._id !== chat._id));
  };

  // Function to handle changes in group name
  const onGroupNameChange = (chat: IChatListItem) => {
    // Check if the chat being changed is the currently active chat
    if (chat._id === currentChat.current?._id) {
      // Update the current chat with the new details
      currentChat.current = chat;

      // Save the updated chat details to local storage
      LocalStorage.set("currentChat", chat);
    }

    // Update the list of chats with the new chat details
    setChats((prev) => [
      // Map through the previous chats
      ...prev.map((c) => {
        // If the current chat in the map matches the chat being changed, return the updated chat
        if (c._id === chat._id) {
          return chat;
        }
        // Otherwise, return the chat as-is without any changes
        return c;
      }),
    ]);
  };

  useEffect(() => {
    // Fetch the chat list from the server.
    getChats();

    // Retrieve the current chat details from local storage.
    const _currentChat = LocalStorage.get("currentChat");

    // If there's a current chat saved in local storage:
    if (_currentChat) {
      // Set the current chat reference to the one from local storage.
      currentChat.current = _currentChat;
      // If the socket connection exists, emit an event to join the specific chat using its ID.
      socket?.emit(JOIN_CHAT_EVENT, _currentChat.current?._id);
      // Fetch the messages for the current chat.
      getMessages();
    }
    // An empty dependency array ensures this useEffect runs only once, similar to componentDidMount.
  }, []);

  useEffect(() => {
    // If the socket isn't initialized, we don't set up listeners.
    if (!socket) return;

    // Set up event listeners for various socket events:
    // Listener for when the socket connects.
    socket.on(CONNECTED_EVENT, onConnect);
    // Listener for when the socket disconnects.
    socket.on(DISCONNECT_EVENT, onDisconnect);
    // Listener for when a user is typing.
    socket.on(TYPING_EVENT, handleOnSocketTyping);
    // Listener for when a user stops typing.
    socket.on(STOP_TYPING_EVENT, handleOnSocketStopTyping);
    // Listener for when a new message is received.
    socket.on(MESSAGE_RECEIVED_EVENT, onMessageReceived);
    // Listener for the initiation of a new chat.
    socket.on(NEW_CHAT_EVENT, onNewChat);
    // Listener for when a user leaves a chat.
    socket.on(LEAVE_CHAT_EVENT, onChatLeave);
    // Listener for when a group's name is updated.
    socket.on(UPDATE_GROUP_NAME_EVENT, onGroupNameChange);

    // When the component using this hook unmounts or if `socket` or `chats` change:
    return () => {
      // Remove all the event listeners we set up to avoid memory leaks and unintended behaviors.
      socket.off(CONNECTED_EVENT, onConnect);
      socket.off(DISCONNECT_EVENT, onDisconnect);
      socket.off(TYPING_EVENT, handleOnSocketTyping);
      socket.off(STOP_TYPING_EVENT, handleOnSocketStopTyping);
      socket.off(MESSAGE_RECEIVED_EVENT, onMessageReceived);
      socket.off(NEW_CHAT_EVENT, onNewChat);
      socket.off(LEAVE_CHAT_EVENT, onChatLeave);
      socket.off(UPDATE_GROUP_NAME_EVENT, onGroupNameChange);
    };
  }, [socket, chats]);

  return (
    <>
      <AddChat
        open={openAddChat}
        onClose={() => setOpenAddChat(!openAddChat)}
        onSuccess={() => {
          getChats();
        }}
      />

      <div className="w-full justify-between items-stretch h-screen flex flex-shrink-0">
        <div className="w-1/3 relative overflow-y-auto bg-gray-900">
          <div className="px-4 py-[26px] text-white flex items-center justify-between bg-gray-800">
            <div className="flex items-center justify-start">
              <p>@{user?.username}</p>
            </div>

            <div className="flex items-center justify-between">
              <Button
                size="sm"
                onClick={() => setOpenAddChat(true)}
                className="mr-2"
              >
                <p className="text-sm">Add Chat</p>
              </Button>

              <Button onClick={() => logout()} size="sm">
                <p className="text-sm">Logout</p>
              </Button>
            </div>
          </div>
          <div className="px-2 ">
            <input
              placeholder="Search user or group..."
              value={localSearchQuery}
              className="w-full border-gray-700 border-2 rounded px-2.5 py-2 my-4 bg-transparent disabled:opacity-[0.4] focus:bg-transparent focus:outline-none text-white"
              onChange={(e) =>
                setLocalSearchQuery(e.target.value.toLowerCase())
              }
            />
          </div>

          {loadingChats ? (
            <div className="flex justify-center items-center h-[calc(100%-88px)]">
              <Typing />
            </div>
          ) : (
            [...chats]
              // Filtering chats based on a local search query
              .filter((chat) =>
                // If there's a localSearchQuery, filter chats that contain the query in their metadata title
                localSearchQuery
                  ? getChatObjectMetadata(chat, user!)
                      .title?.toLocaleLowerCase()
                      ?.includes(localSearchQuery)
                  : // If there's no localSearchQuery, include all chats
                    true
              )
              .map((chat) => {
                return (
                  <ChatItem
                    chat={chat}
                    isActive={chat._id === currentChat.current?._id}
                    unreadCount={
                      unreadMessages.filter((n) => n.chat === chat._id).length
                    }
                    onClick={(chat) => {
                      if (
                        currentChat.current?._id &&
                        currentChat.current?._id === chat._id
                      )
                        return;
                      LocalStorage.set("currentChat", chat);
                      currentChat.current = chat;
                      setMessage("");
                      getMessages();
                    }}
                    key={chat._id}
                    onChatDelete={(chatId) => {
                      setChats((prev) =>
                        prev.filter((chat) => chat._id !== chatId)
                      );
                      if (currentChat.current?._id === chatId) {
                        currentChat.current = null;
                        LocalStorage.remove("currentChat");
                      }
                    }}
                  />
                );
              })
          )}
        </div>
        <div className="w-2/3 border-l-[0.1px] border-gray-700">
          {currentChat.current && currentChat.current._id ? (
            <>
              <div className="p-4 fixed bg-gray-800 text-white top-0 z-20 flex justify-between items-center w-full">
                <div className="flex justify-start items-center w-max gap-3">
                  {currentChat.current.isGroupChat ? (
                    <div className="w-14 relative h-14 flex-shrink-0 flex justify-start items-center flex-nowrap">
                      {currentChat.current.participants
                        .slice(0, 3)
                        .map((participant, i) => {
                          return (
                            <img
                              key={participant._id}
                              src={UserImage}
                              className={`w-11 h-11 border-4 border-gray-800 rounded-full absolute ${
                                i === 0
                                  ? "left-0 z-30"
                                  : i === 1
                                  ? "left-2 z-20"
                                  : i === 2
                                  ? "left-4 z-10"
                                  : ""
                              }`}
                            />
                          );
                        })}
                    </div>
                  ) : (
                    <img
                      className="h-14 w-14 rounded-full flex flex-shrink-0 object-cover"
                      src={UserImage}
                    />
                  )}
                  <div>
                    <p className="font-bold">
                      {getChatObjectMetadata(currentChat.current, user!).title}
                    </p>
                    <small className="text-zinc-400">
                      {
                        getChatObjectMetadata(currentChat.current, user!)
                          .description
                      }
                    </small>
                  </div>
                </div>
              </div>
              <div
                className={`p-8 bg-gray-900 overflow-y-auto flex flex-col-reverse gap-6 w-full h-[calc(100%-88px)] scrollbar-none`}
                id="message-window"
              >
                {loadingMessages ? (
                  <div className="flex justify-center items-center h-[calc(100%-88px)]">
                    <Typing />
                  </div>
                ) : (
                  <>
                    {isTyping ? <Typing /> : null}
                    {messages?.map((msg) => {
                      return (
                        <MessageItem
                          key={msg._id}
                          isOwnMessage={msg.sender?._id === user?._id}
                          isGroupChatMessage={currentChat.current?.isGroupChat}
                          message={msg}
                        />
                      );
                    })}
                  </>
                )}
              </div>
              <div className="fixed bg-gray-800 bottom-0 p-4 flex justify-between items-center w-full gap-2 border-t-[0.1px] border-gray-800 z-20">
                <input
                  placeholder="Message"
                  className="w-full border-gray-700 border-2 rounded px-2.5 py-2 bg-transparent focus:bg-transparent focus:outline-none text-white"
                  value={message}
                  onChange={handleOnMessageChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      sendChatMessage();
                    }
                  }}
                />
                <button
                  onClick={sendChatMessage}
                  disabled={!message}
                  className="p-4 rounded-full bg-dark hover:bg-secondary disabled:opacity-50"
                >
                  <Send className="w-6 h-6 text-white" />
                </button>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex justify-center items-center bg-gray-900 text-white">
              No chat selected
            </div>
          )}
        </div>
      </div>
    </>
  );
};
