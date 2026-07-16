import "dotenv/config";

import dns from "node:dns";
import http from "node:http";
import emergencyRoutes from "./routes/emergencyRoutes.js";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { Server } from "socket.io";
import authorityRoutes from "./routes/authorityRoutes.js";
import connectDatabase from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

import {
  errorHandler,
  notFoundHandler,
} from "./middleware/errorMiddleware.js";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const app = express();
const httpServer = http.createServer(app);

const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

const corsOptions = {
  origin(origin, callback) {
    // Allow requests without an Origin header, such as PowerShell/Postman.
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS blocked origin: ${origin}`));
  },

  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],
};

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.set("io", io);

/*
 * Global middleware must come before all routes.
 */
app.use(helmet());
app.use(cors(corsOptions));

app.use(
  express.json({
    limit: "1mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  })
);

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

app.use("/api", apiLimiter);

/*
 * Application routes come after middleware.
 */
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/emergencies", emergencyRoutes);
app.use("/api/authority", authorityRoutes);

app.get("/", (request, response) => {
  response.json({
    success: true,
    service: "Narada Messenger API",
    status: "online",
    message:
      "Decentralized emergency communication simulation backend is operational.",
  });
});

app.get("/api/health", (request, response) => {
  response.status(200).json({
    success: true,
    service: "Narada Messenger API",
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || "development",
    websocket: "enabled",

    database:
      process.env.MONGODB_URI &&
      process.env.MONGODB_URI !==
        "your_mongodb_connection_string"
        ? "configured"
        : "not configured",
  });
});

/*
 * Socket.IO events.
 */
io.on("connection", (socket) => {

  console.log(
    `Connected: ${socket.id}`
  );

  socket.on("join", (naradaId) => {

    socket.join(naradaId);

    console.log(
      `${naradaId} joined`
    );

  });

  socket.on(
    "disconnect",
    () => {
      console.log(
        `${socket.id} disconnected`
      );
    }
  );
});
/*
 * These must remain after all valid routes.
 */
app.use(notFoundHandler);
app.use(errorHandler);

const port = Number(process.env.PORT) || 5000;

const startServer = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (
    mongoUri &&
    mongoUri !== "your_mongodb_connection_string"
  ) {
    await connectDatabase();
  } else {
    console.warn(
      "MongoDB is not configured. Server will start without database access."
    );
  }

  httpServer.listen(port, () => {
    console.log(
      `Narada API running on http://localhost:${port}`
    );

    console.log(
      `Allowed frontend origins: ${allowedOrigins.join(", ")}`
    );
  });
};

startServer();

const shutdownServer = (signal) => {
  console.log(
    `${signal} received. Shutting down Narada server...`
  );

  httpServer.close(() => {
    console.log("HTTP server closed.");
    process.exit(0);
  });

  setTimeout(() => {
    process.exit(1);
  }, 10000).unref();
};

process.on("SIGTERM", () =>
  shutdownServer("SIGTERM")
);

process.on("SIGINT", () =>
  shutdownServer("SIGINT")
);