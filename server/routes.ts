import type { Express } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(app: Express): Promise<Server> {
  // This app uses external API, no local routes needed
  // All data comes from: https://backend-blog-8uqk.onrender.com/api

  const httpServer = createServer(app);

  return httpServer;
}
