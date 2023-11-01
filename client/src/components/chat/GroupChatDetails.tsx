import * as Dialog from "@radix-ui/react-dialog";
import React, { useState, useEffect } from "react";
import {
  addParticipantToGroup,
  deleteGroup,
  getAvailableUsers,
  getGroupInfo,
  removeParticipantFromGroup,
  updateGroupName,
} from "../../assets/api";
import { useAuth } from "../../context/AuthContext";
import { requestHandler } from "../../utils/RequestHandler";
import { Button } from "../Button";
import { SelectItem } from "../Select";
import { Pencil, Trash, X, Users, UserPlus } from "lucide-react";
import { toast } from "react-hot-toast";

export const GroupChatDetails: React.FC<{
  open: boolean;
  chatId: string;
  onGroupDelete: (chatId: string) => void;
  onClose: () => void;
}> = ({ chatId, onGroupDelete, open, onClose }) => {
  const { user } = useAuth();
  // State to manage the UI flag for adding a participant
  const [addingParticipant, setAddingParticipant] = useState(false);
  // State to manage the UI flag for renaming a group
  const [renamingGroup, setRenamingGroup] = useState(false);
  // State to capture the ID of the participant to be added
  const [participantToBeAdded, setParticipantToBeAdded] = useState("");
  // State to capture the new name when renaming a group
  const [newGroupName, setNewGroupName] = useState("");

  // State to store the current group details, initially set to null
  const [groupDetails, setGroupDetails] = useState<IChatListItem | null>(null);

  // State to manage a list of users, initially set as an empty array
  const [users, setUsers] = useState<IUser[]>([]);

  const handleUpdateName = async () => {
    if (!newGroupName) return toast.error("Group name is required");

    requestHandler(
      async () => await updateGroupName(chatId, newGroupName),
      null,
      (res) => {
        const { data } = res;
        setGroupDetails(data); // Set the new group details.
        setNewGroupName(data.name); // Set the new group name state.
        setRenamingGroup(false); // Set the state to not renaming.
        toast.success(`Group name updated to ${data.name}`);
      },
      alert
    );
  };

  // Function to delete a group chat.
  const deleteGroupChat = async () => {
    // Check if the user is the admin of the group before deletion.
    if (groupDetails?.admin !== user?._id) {
      return alert("You are not the admin of the group");
    }

    // Request to delete the group chat.
    requestHandler(
      // Call to delete the group using the provided chatId.
      async () => await deleteGroup(chatId),
      null,
      // On successful deletion, trigger onGroupDelete and close any modals/dialogs.
      () => {
        onGroupDelete(chatId);
      },
      alert
    );
  };

  const addParticipant = async () => {
    // Check if there's a participant selected to be added.
    if (!participantToBeAdded)
      return alert("Please select a participant to add.");
    // Make a request to add the participant to the group.
    requestHandler(
      // Actual request to add the participant.
      async () => await addParticipantToGroup(chatId, participantToBeAdded),
      // No loading callback provided, so passing `null`.
      null,
      // Callback on success.
      (res) => {
        // Destructure the response to get the data.
        const { data } = res;
        // Create an updated group details object.
        const updatedGroupDetails = {
          ...groupDetails,
          participants: data?.participants || [],
        };
        // Update the group details state with the new details.
        setGroupDetails(updatedGroupDetails as IChatListItem);
        // Alert the user that the participant was added.
        alert("Participant added");
      },
      alert
    );
  };

  const removeParticipant = async (participantId: string) => {
    requestHandler(
      // This is the main request function to remove a participant from the group.
      async () => await removeParticipantFromGroup(chatId, participantId),
      // Null represents an optional loading state callback
      null,
      // This is the callback after the request is successful.
      () => {
        // Copy the existing group details.
        const updatedGroupDetails = {
          ...groupDetails,
          // Update the participants list by filtering out the removed participant.
          participants:
            (groupDetails?.participants &&
              groupDetails?.participants?.filter(
                (p) => p._id !== participantId
              )) ||
            [],
        };
        // Update the state with the modified group details.
        setGroupDetails(updatedGroupDetails as IChatListItem);
        // Inform the user that the participant has been removed.
        alert("Participant removed");
      },
      alert
    );
  };

  // Function to fetch group information
  const fetchGroupInformation = async () => {
    requestHandler(
      // Fetching group info for a specific chatId
      async () => await getGroupInfo(chatId),
      // Placeholder for a loading callback (currently set to null)
      null,
      // If the request is successful, destructure the response and set group details and the group name
      (res) => {
        const { data } = res;
        setGroupDetails(data);
        setNewGroupName(data?.name || "");
      },
      alert
    );
  };

  const getUsers = () => {
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

  const handleClose = () => {
    onClose();
  };

  useEffect(() => {
    if (!open) return;

    fetchGroupInformation();
    getUsers();
  }, [open]);
  return (
    <Dialog.Root open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-black bg-opacity-60 data-[state=open]:animate-overlayShow fixed inset-0 z-30" />
        <Dialog.Content className="fixed top-[50%] left-[50%] h-[90vh] translate-x-[-50%] translate-y-[-50%] rounded-md bg-gray-800  w-screen max-w-2xl z-40 overflow-y-auto shadow-xl">
          <div className="flex h-full flex-col overflow-y-scroll py-6">
            <div className="px-4 sm:px-6">
              <div className="flex items-start justify-between">
                <div className="ml-3 flex h-7 items-center">
                  <button
                    type="button"
                    className="relative rounded-md bg-secondary text-zinc-400 hover:text-zinc-500 focus:outline-none"
                    onClick={handleClose}
                  >
                    <span className="absolute -inset-2.5" />
                    <span className="sr-only">Close panel</span>
                    <X className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
            <div className="relative mt-6 flex-1 px-4 sm:px-6">
              <div className="flex flex-col justify-center items-start">
                <div className="flex pl-16 justify-center items-center relative w-full h-max gap-3">
                  {groupDetails?.participants.slice(0, 3).map((p) => {
                    return (
                      <img
                        className="w-20 h-20 -ml-16 rounded-full outline outline-4 outline-gray-800"
                        key={p._id}
                        src={p.avatar.url}
                        alt="avatar"
                      />
                    );
                  })}
                  {groupDetails?.participants &&
                    groupDetails?.participants.length > 3 && (
                      <p>+{groupDetails?.participants.length - 3}</p>
                    )}
                </div>
                <div className="w-full flex flex-col justify-center items-center text-center">
                  {renamingGroup ? (
                    <div className="w-full flex justify-center items-center mt-5 gap-2">
                      <input
                        className="border-gray-700 border-2 rounded px-2.5 py-2 bg-transparent disabled:opacity-[0.5] focus:outline-none focus:border-gray-300 text-white focus:bg-transparent"
                        placeholder="Enter new group name..."
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                      />
                      <Button onClick={handleUpdateName}>Save</Button>
                      <Button onClick={() => setRenamingGroup(false)}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="w-full inline-flex justify-center items-center text-center mt-5">
                      <h1 className="text-2xl font-semibold text-white truncate-1">
                        {groupDetails?.name}
                      </h1>
                      {groupDetails?.admin === user?._id && (
                        <button onClick={() => setRenamingGroup(true)}>
                          <Pencil className="w-5 h-5 ml-4 text-white" />
                        </button>
                      )}
                    </div>
                  )}
                  <p className="mt-2 text-zinc-400 text-sm">
                    Group · {groupDetails?.participants.length} participants
                  </p>
                </div>
                <hr className="border-[0.1px] border-zinc-600 my-5 w-full" />
                <div className="w-full">
                  <p className="inline-flex items-center text-white">
                    <Users className="h-6 w-6 mr-2" />{" "}
                    {groupDetails?.participants.length} Participants
                  </p>
                  <div className="w-full">
                    {groupDetails?.participants.map((part) => {
                      return (
                        <div key={part._id}>
                          <div className="flex justify-between items-center w-full py-4">
                            <div className="flex justify-start items-start gap-3 w-full">
                              <img
                                className="h-12 w-12 rounded-full"
                                src={part.avatar.url}
                              />
                              <div>
                                <p className="text-white font-semibold text-sm inline-flex items-center w-full">
                                  {part.username}{" "}
                                  {part._id === groupDetails.admin && (
                                    <span className="ml-2 text-[10px] px-4 bg-success/10 border-[0.1px] border-success rounded-full text-success">
                                      admin
                                    </span>
                                  )}
                                </p>
                                <small className="text-zinc-400">
                                  {part.email}
                                </small>
                              </div>
                            </div>
                            {groupDetails.admin === user?._id && (
                              <div>
                                <Button
                                  onClick={() => {
                                    const ok = confirm(
                                      "Are you sure you want to remove " +
                                        user.username +
                                        " ?"
                                    );
                                    if (ok) {
                                      removeParticipant(part._id || "");
                                    }
                                  }}
                                  size="sm"
                                >
                                  Remove
                                </Button>
                              </div>
                            )}
                          </div>
                          <hr className="border-[0.1px] border-zinc-600 my-1 w-full" />
                        </div>
                      );
                    })}
                    {groupDetails?.admin === user?._id && (
                      <div className="w-full my-5 flex flex-col justify-center items-center gap-4">
                        {!addingParticipant ? (
                          <Button onClick={() => setAddingParticipant(true)}>
                            <UserPlus className="w-5 h-5 mr-1" /> Add
                            participant
                          </Button>
                        ) : (
                          <div className="w-full flex justify-start items-center gap-2">
                            <SelectItem
                              placeholder="Select a user to add..."
                              value={participantToBeAdded}
                              options={users.map((user) => ({
                                label: user.username,
                                value: user._id,
                              }))}
                              onChange={({ value }) => {
                                setParticipantToBeAdded(value);
                              }}
                            />
                            <Button
                              onClick={() => addParticipant()}
                              className="mt-2"
                            >
                              Add
                            </Button>
                            <Button
                              onClick={() => {
                                setAddingParticipant(false);
                                setParticipantToBeAdded("");
                              }}
                              className="mt-2"
                            >
                              Cancel
                            </Button>
                          </div>
                        )}
                        <Button
                          onClick={() => {
                            const ok = confirm(
                              "Are you sure you want to delete this group?"
                            );
                            if (ok) {
                              deleteGroupChat();
                            }
                          }}
                        >
                          <Trash className="w-5 h-5 mr-1" /> Delete group
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
