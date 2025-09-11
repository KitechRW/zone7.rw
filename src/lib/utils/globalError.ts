import logger from "./logger";

export const globalErrorHandler = () => {
  if (globalThis._globalErrorHandlerInitialized) {
    return;
  }

  globalThis._globalErrorHandlerInitialized = true;

  process.on("uncaughtException", (error: Error) => {
    logger.error("Uncaught Exception - Shutting down", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
  });

  process.on("unhandledRejection", (reason: unknown) => {
    logger.error("Unhandled Rejection - Shutting down", {
      reason: reason instanceof Error ? reason.message : reason,
      stack: reason instanceof Error ? reason.stack : undefined,
    });

    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
  });

  ["SIGTERM", "SIGINT"].forEach((signal) => {
    process.on(signal, () => {
      logger.info(`${signal} received - Shutting down gracefully`);
      process.exit(0);
    });
  });

  logger.info("Global error handlers initialized");
};

declare global {
  var _globalErrorHandlerInitialized: boolean | undefined;
}
