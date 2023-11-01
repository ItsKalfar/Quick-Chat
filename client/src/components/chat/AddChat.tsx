import * as Dialog from "@radix-ui/react-dialog";
import { Users2, XCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  createGroupChat,
  createUserChat,
  getAvailableUsers,
} from "../../assets/api";
import { requestHandler } from "../../utils/RequestHandler";
import { Button } from "../Button";
import { SelectItem } from "../Select";
import { toast } from "react-hot-toast";
import { Switch } from "@headlessui/react";

import UserImage from "../../assets/images/user.png";

export const AddChat: React.FC<{
  onSuccess: (chat: IChatListItem) => void;
  open: boolean;
  onClose: () => void;
}> = ({ onSuccess, open, onClose }) => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [groupName, setGroupName] = useState("");
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [groupParticipants, setGroupParticipants] = useState<string[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<null | string>(null);
  const [creatingChat, setCreatingChat] = useState(false);

  const handleClose = () => {
    setUsers([]);

    setSelectedUserId("");

    setGroupName("");

    setGroupParticipants([]);

    setIsGroupChat(false);
    // Execute the onClose callback/function
    onClose();
  };

  const getUsers = async () => {
    requestHandler(
      async () => await getAvailableUsers(),
      null,
      (res) => {
        const { data } = res;
        setUsers(data || []);
      },
      alert
    );
  };

  const createNewChat = async () => {
    if (!selectedUserId) return toast.error("Please select a user");

    await requestHandler(
      async () => await createUserChat(selectedUserId),
      setCreatingChat,
      (res) => {
        const { data } = res;
        if (res.statusCode === 200) {
          alert("Chat with selected user already exists");
          return;
        }
        onSuccess(data);
        handleClose();
      },
      alert
    );
  };

  // Function to create a new group chat
  const createNewGroupChat = async () => {
    // Check if a group name is provided
    if (!groupName) return alert("Group name is required");
    // Ensure there are at least 2 group participants
    if (!groupParticipants.length || groupParticipants.length < 2)
      return alert("There must be at least 2 group participants");

    // Handle the request to create a group chat
    await requestHandler(
      // Callback to create a group chat with name and participants
      async () =>
        await createGroupChat({
          name: groupName,
          participants: groupParticipants,
        }),
      setCreatingChat, // Callback to handle loading state
      // Success callback
      (res) => {
        const { data } = res; // Extract data from response
        onSuccess(data); // Execute the onSuccess function with received data
        handleClose(); // Close the modal or popup
      },
      alert
    );
  };

  useEffect(() => {
    if (open) {
      getUsers();
    }
  }, [open]);

  return (
    <Dialog.Root open={open}>
      <Dialog.Portal>
        <Dialog.Content className="data-[state=open]:animate-contentShow bg-gray-800 text-white fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title>Create Chat</Dialog.Title>
            <button
              type="button"
              className="rounded-md bg-transparent text-zinc-400 hover:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-white focus:ring-offset-2"
              onClick={() => handleClose()}
            >
              <span className="sr-only">Close</span>
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div>
            <Switch.Group as="div" className="flex items-center my-5">
              <Switch
                checked={isGroupChat}
                onChange={setIsGroupChat}
                className={`relative outline outline-[1px] outline-white inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-0 ${
                  isGroupChat ? "bg-gray-900" : "bg-gray-600"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`
                          ${
                            isGroupChat
                              ? "translate-x-5 bg-white"
                              : "translate-x-0 bg-white"
                          }
                          "pointer-events-none inline-block h-5 w-5 transform rounded-full shadow ring-0 transition duration-200 ease-in-out`}
                />
              </Switch>
              <Switch.Label as="span" className="ml-3 text-sm">
                <span
                  className={`
                          font-medium text-white ${
                            isGroupChat ? "" : "opacity-40"
                          }                       
                        `}
                >
                  Is it a group chat?
                </span>{" "}
              </Switch.Label>
            </Switch.Group>
          </div>
          <div>
            {isGroupChat && (
              <input
                className="w-full mb-2 border-gray-700 border-2 rounded px-2.5 py-2 bg-transparent focus:bg-transparent"
                placeholder={"Enter a group name..."}
                value={groupName}
                onChange={(e) => {
                  setGroupName(e.target.value);
                }}
              />
            )}
            <SelectItem
              placeholder={
                isGroupChat
                  ? "Select group participants"
                  : "Select a user to chat"
              }
              value={isGroupChat ? "" : selectedUserId || ""}
              options={users.map((user) => {
                return {
                  label: user.username,
                  value: user._id,
                };
              })}
              onChange={({ value }) => {
                if (isGroupChat && !groupParticipants.includes(value)) {
                  setGroupParticipants([...groupParticipants, value]);
                } else {
                  setSelectedUserId(value);
                }
              }}
            />
          </div>
          {isGroupChat && (
            <div className="my-4">
              <span className={"font-medium inline-flex items-center"}>
                <Users2 className="h-5 w-5 mr-2" /> Selected participants
              </span>
              <div className="flex justify-start items-center flex-wrap gap-2 mt-3">
                {users
                  .filter((user) => {
                    return groupParticipants.includes(user._id);
                  })
                  ?.map((participant) => {
                    return (
                      <div
                        className="inline-flex bg-secondary rounded-full p-2 border-[1px] border-zinc-400 items-center gap-2 text-gray-700"
                        key={participant._id}
                      >
                        <img
                          className="h-6 w-6 rounded-full object-cover"
                          src={UserImage}
                        />
                        <p>{participant.username}</p>
                        <XCircle
                          role="button"
                          className="w-5 h-4  cursor-pointer"
                          onClick={() => {
                            setGroupParticipants(
                              groupParticipants.filter(
                                (p) => p !== participant._id
                              )
                            );
                          }}
                        />
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
          <div className="mt-5 flex justify-between items-center gap-4">
            <Button
              disabled={creatingChat}
              onClick={handleClose}
              className="w-1/2"
            >
              Close
            </Button>
            <Button
              disabled={creatingChat}
              onClick={isGroupChat ? createNewGroupChat : createNewChat}
              className="w-1/2"
            >
              Create
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
