import express from "express";
import cors from "cors";
import morgan from "morgan";
import { env } from "./config/env";
import apiRoutes from "./routes/index";
import { globalErrorHandler, notFound } from "./middleware/error.middleware";

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.corsOrigin, credentials: true }));

  app.use(morgan("dev"));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use("/api", apiRoutes);

  app.use(notFound);

  app.use(globalErrorHandler);

  return app;
}
