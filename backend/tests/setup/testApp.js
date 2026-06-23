import express from "express";
import cors from "cors";
import errorHandler from "../../middleware/errorHandler.js";
import usersRoutes from "../../routes/users.js";
import userRoutes from "../../routes/user.js";
import articlesRoutes from "../../routes/articles.js";
import profilesRoutes from "../../routes/profiles.js";
import tagsRoutes from "../../routes/tags.js";

export default function createTestApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use("/api/users", usersRoutes);
  app.use("/api/user", userRoutes);
  app.use("/api/articles", articlesRoutes);
  app.use("/api/profiles", profilesRoutes);
  app.use("/api/tags", tagsRoutes);

  app.use(errorHandler);
  return app;
}
