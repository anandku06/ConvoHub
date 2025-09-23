import "../instrument.js"
import express from "express";
import { ENV } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { clerkMiddleware } from "@clerk/express";
import { inngest, functions } from "./config/inngest.js";
import { serve } from "inngest/express";
import chatRoutes from "./routes/chat.routes.js";
import * as Sentry from "@sentry/node";


const app = express();

app.use(express.json());
app.use(clerkMiddleware()); // Clerk middleware to handle authentication ; used to protect routes


app.get("/", (req, res) => {
  res.send("Hello World!");
});


// Inngest setup
app.use("/api/inngest", serve({ client: inngest, functions }));

app.get("/debug-sentry", (req, res) => {
  throw new Error("Sentry is configured correctly!");
});

app.use("/api/chat", chatRoutes);

Sentry.setupExpressErrorHandler(app);

const startServer = async () => {
  try {
    await connectDB();
    if (ENV.NODE_ENV !== "production") {
      app.listen(ENV.PORT, () => {
        console.log(`Server is listening on port ${ENV.PORT}`);
      });
    }
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

if (ENV.NODE_ENV !== "production") {
  startServer();
}

export default app;