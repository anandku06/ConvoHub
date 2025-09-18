import { Inngest } from "inngest";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "convohub" });

const syncUser = inngest.createFunction(
    {id : "sync-user"},
    {event : "clerk/user.created"},
    async (event) => {}
)

// Create an empty array where we'll export future Inngest functions
export const functions = [];