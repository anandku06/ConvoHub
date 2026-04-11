import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { useChatContext } from "stream-chat-react";
import * as Sentry from "@sentry/react";
import toast from "react-hot-toast";
import {
  AlertCircleIcon,
  HashIcon,
  LockIcon,
  UsersIcon,
  XIcon,
} from "lucide-react";

const CreateChannelModal = ({ onClose }) => {
  const [channelName, setChannelName] = useState("");
  const [channelType, setChannelType] = useState("public");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [_, setSearchParams] = useSearchParams();

  const { client, setActiveChannel } = useChatContext();

  const validateChannelName = (name) => {
    if (!name.trim()) return "Channel name cannot be empty.";
    if (name.length < 3) return "Channel name must be at least 3 characters.";
    if (name.length > 50) return "Channel name cannot exceed 50 characters.";

    return "";
  };

  // fetch users for member selection
  useEffect(() => {
    const fetchUsers = async () => {
      if (!client?.user) return;
      setLoadingUsers(true);

      try {
        const response = await client.queryUsers(
          {
            id: { $ne: client.user.id },
          },
          {
            name: 1,
          },
          {
            limit: 10,
          },
        );

        setUsers(response.users || []);
      } catch (error) {
        console.error("Error fetching users:", error);
        Sentry.captureException(error, {
          tags: {
            component: "CreateChannelModal",
          },
          extra: {
            context: "Failed to fetch users for channel member selection",
          },
        });

        setUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };
  }, [client]);

  // auto-select all users for public channels
  useEffect(() => {
    if (channelType === "public") setSelectedUsers(users.map((u) => u.id));
    else setSelectedUsers([]);
  }, [channelType, users]);

  const handleChannelNameChange = (e) => {
    const value = e.target.value;
    setChannelName(value);
    setError(validateChannelName(value));
  };

  const handleMemberToggle = (id) => {
    if (selectedUsers.includes(id)) {
      setSelectedUsers(selectedUsers.filter((uid) => uid !== id));
    } else {
      setSelectedUsers([...selectedUsers, id]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateChannelName(channelName);
    if (validationError) return setError(validationError);

    if (isCreating || !client?.user) return;

    setIsCreating(true);
    setError("");

    try {
      const channelId = channelName
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-_]/g, "")
        .slice(0, 20);

      const channelData = {
        name: channelName.trim(),
        created_by_id: client.user.id,
        users: [client.user.id, ...selectedUsers],
      };

      if (description) channelData.description = description;

      if (channelType === "private") {
        channelData.private = true;
        channelData.visibility = "private";
      } else {
        channelData.visibility = "public";
        channelData.discoverable = true;
      }

      const channel = client.channel("messaging", channelId, channelData);

      await channel.watch();

      setActiveChannel(channel);
      setSearchParams({ channel: channel.id });

      toast.success(`Channel "${channelName}" created successfully!`);
      onClose();
    } catch (error) {
      console.error("Error creating channel:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="create-channel-modal-overlay">
      <div className="create-channel-modal">
        <div className="create-channel-modal__header">
          <h2>Create New Channel</h2>
          <button onClick={onClose} className="create-channel-modal__close">
            <XIcon className="size-5" />
          </button>
        </div>

        {/* form */}
        <form onSubmit={handleSubmit} className="create-channel-modal__form">
          {error && (
            <div className="form-error">
              <AlertCircleIcon className="size-4" />
              <span>{error}</span>
            </div>
          )}

          {/* channel name */}
          <div className="form-group">
            <div className="input-with-icon">
              <HashIcon className="w-4 h-4 input-icon" />
              <input
                type="text"
                id="channelName"
                value={channelName}
                onChange={handleChannelNameChange}
                placeholder="e.g. marketing"
                className={`form-input ${error ? "form-input--error" : ""}`}
                autoFocus
                maxLength={22}
              />
            </div>

            {/* channel id preview */}
            {channelName && (
              <div className="form-hint">
                Channel ID will be: #
                {channelName
                  .toLowerCase()
                  .replace(/\s+/g, "-")
                  .replace(/[^a-z0-9-_]/g, "")}
              </div>
            )}
          </div>

          {/* channel type */}
          <div className="form-group">
            <label>Channel Type</label>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  value="public"
                  checked={channelType === "public"}
                  onChange={(e) => setChannelType(e.target.value)}
                />
                <div className="radio-content">
                  <HashIcon className="size-4" />
                  <div>
                    <div className="radio-title">Public</div>
                    <div className="radio-description">
                      Anyone can join this channel
                    </div>
                  </div>
                </div>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  value="private"
                  checked={channelType === "private"}
                  onChange={(e) => setChannelType(e.target.value)}
                />
                <div className="radio-content">
                  <LockIcon className="size-4" />
                  <div>
                    <div className="radio-title">Private</div>
                    <div className="radio-description">
                      Only invited members can join
                    </div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* add members component */}
          {channelType === "private" && (
            <div className="form-group">
              <label>Add members</label>
              <div className="member-selection-header">
                <button
                  className="btn btn-secondary btn-small"
                  type="button"
                  onClick={() => setSelectedUsers(users.map((u) => u.id))}
                  disabled={loadingUsers || users.length === 0}
                >
                  <UsersIcon className="w-4 h-4" />
                </button>
                <span className="selected-count">
                  {selectedUsers.length} selected
                </span>
              </div>

              <div className="members-list">
                {loadingUsers ? (
                  <p>Loading users...</p>
                ) : users.length === 0 ? (
                  <p>No other users found.</p>
                ) : (
                  users.map((u) => (
                    <label key={u.id} className="member-item">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(u.id)}
                        onChange={() => handleMemberToggle(u.id)}
                        className="member-checkbox"
                      />
                      {u.image ? (
                        <img
                          src={u.image}
                          alt={u.name || u.id}
                          className="member-avatar"
                        />
                      ) : (
                        <div className="member-avatar member-avatar-placeholder">
                          <span>
                            {(u.name || u.id).charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="member-name">{u.name || u.id}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}

          {/* description */}
          <div className="form-group">
            <label htmlFor="description">Description (Optional)</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this channel about?"
              className="form-textarea"
              rows={3}
            />
          </div>

          {/* actions */}
          <div className="create-channel-modal__actions">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!channelName.trim() || isCreating}
              className="btn btn-primary"
            >
              {isCreating ? "Creating..." : "Create Channel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateChannelModal;
