import { UserButton } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { useStreamChat } from "../hooks/useStreamChat";
import PageLoader from "../components/PageLoader";
import {
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";

import "../styles/stream-chat-theme.css";
import { PlusIcon } from "lucide-react";
import CreateChannelModal from "../components/CreateChannelModal";

export const HomePage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeChannel, setActiveChannel] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const { chatClient, tokenLoading, tokenError } = useStreamChat();

  // set the active channel from the URL param
  useEffect(() => {
    if (chatClient) {
      const channelId = searchParams.get("channel");

      if (channelId) {
        const channel = chatClient.channel("messaging", channelId);
        setActiveChannel(channel);
      }
    }
  }, [chatClient, searchParams]);

  if (tokenError) return <p>Something went wrong!!</p>;
  if (tokenLoading || !chatClient) return <PageLoader />;

  return (
    <div className="chat-wrapper ">
      <Chat client={chatClient}>
        <div className="chat-container">
          {/* LEFT SIDEBAR */}
          <div className="str-chat__channel-list">
            <div className="team-channel-list">
              {/* HEADER */}
              <div className="team-channel-list__header gap-4">
                <div className="brand-container">
                  <img src="/logo.png" alt="Logo" className="brand-logo" />
                  <span className="brand-name">ConvoHub</span>
                </div>
                <div className="user-button-wrapper">
                  <UserButton />
                </div>
              </div>
              {/* Channels */}
              <div className="team-channel-list__content">
                <div className="create-channel-section">
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="create-channel-btn"
                  >
                    <PlusIcon className="size-4" />
                    <span>Create Channel</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Container */}
          <div className="chat-main">
            <Channel channel={activeChannel}>
              <Window>
                {/* <CustomChannelHeader /> */}
                <MessageList />
                <MessageInput />
              </Window>
              <Thread />
            </Channel>
          </div>
        </div>

        {isCreateModalOpen && (
          <CreateChannelModal onClose={() => setIsCreateModalOpen(false)} />
        )}
      </Chat>
    </div>
  );
};

/**
 * BEM Naming Convention:
 * - Block: team-channel-list
 * - Element: __header, __content
 * What is BEM? BEM stands for Block, Element, Modifier. It's a naming convention for CSS classes that helps create reusable components and code sharing in front-end development.
 * It consists of three parts:
 * 1. Block: The standalone entity that is meaningful on its own (e.g., team-channel-list).
 * 2. Element: A part of the block that has no standalone meaning and is semantically tied to the block (e.g., __header, __content).
 * 3. Modifier: A flag on a block or element that changes its appearance or behavior (not used in this example, but would be something like --active or --disabled).
 * Why BEM? It provides a clear structure for CSS classes, making it easier to understand the relationship between elements and their styles. It also helps avoid naming conflicts and promotes reusability of components.
 *
 */
