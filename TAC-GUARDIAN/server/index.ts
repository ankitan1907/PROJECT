import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer as createHttpServer } from "http";
import path from "path";
import { handleDemo } from "./routes/demo";
import { StorylineEngine } from "./storyline-engine";

export function createServer() {
  const app = express();
  const httpServer = createHttpServer(app);

  // Initialize storyline engine with WebSocket support
  const storylineEngine = new StorylineEngine(httpServer);

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serve static files from the dist/spa directory
  const staticPath = path.join(process.cwd(), "dist/spa");
  app.use(express.static(staticPath));

  // API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Storyline engine stats endpoint
  app.get("/api/storyline/stats", (_req, res) => {
    res.json(storylineEngine.getStats());
  });

  // Control storyline engine
  app.post("/api/storyline/start", (_req, res) => {
    storylineEngine.startStoryline();
    res.json({ status: "started" });
  });

  app.post("/api/storyline/stop", (_req, res) => {
    storylineEngine.stopStoryline();
    res.json({ status: "stopped" });
  });

  // SPA fallback - serve index.html for all non-API routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  return httpServer;
}
