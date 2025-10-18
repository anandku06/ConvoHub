import { useState, useEffect } from "react";
import { StreamChat } from "stream-chat";
import { useUser } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";
import * as Sentry from "@sentry/react";

const streamApiKey = import.meta.env.VITE_STREAM_API_KEY;

export const useStreamChat = () => {
  const { user } = useUser();
  const [chatClient, setChatClient] = useState(null);

  // fetch stream token using react query
  const {
    data: tokenData,
    isLoading: tokenLoading,
    error: tokenError,
  } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!user?.isSignedIn, // only fetch if user is signed in, (!!) for boolean
    retry: 1,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  // initialize stream chat client
  useEffect(() => {
    const initChat = async () => {
      if (!tokenData?.token || !user || !streamApiKey) return;
      
      const client = StreamChat.getInstance(streamApiKey);

      try {
        await client.connectUser({
          id: user?.id,
          name: user.fullName ?? "Unknown",
          image: user.imageUrl ?? undefined,
        });

        setChatClient(client);
      } catch (error) {
        console.error("Error connecting to stream", error);

        Sentry.captureException(error, {
          tags: { component: "useStreamChat" },
          extra: {
            context: "stream_chat_connection",
            userId: user?.id,
            streamApiKey: streamApiKey ? "present" : "missing",
          },
        });
      }
    };

    initChat();

    // cleanup function
    return () => {
      if (chatClient) {
        chatClient.disconnectUser();
        setChatClient(null);
      }
    };
  }, [tokenData?.token, user?.id]);

  return { chatClient, tokenLoading, tokenError };
};

// The useStreamChat hook initializes and manages the Stream Chat client.
// It fetches a Stream token for the authenticated user using React Query
// and connects the user to the Stream Chat service.
// The hook returns the chat client instance along with loading and error states
// to be used in components that require chat functionality.
