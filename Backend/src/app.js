import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import notificationRouter from "./routes/notification.routes.js"
import errorHandler from "./middlewares/errors.middleware.js";
import snipRoutes from "./routes/snips.routes.js";
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import commentRouter from "./routes/comment.routes.js";
import authRouter from "./routes/auth.routes.js"; // NEW
import channelRouter from "./routes/channel.routes.js";

const app = express();

// ---------- Security middleware ----------
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  })
);

// ---------- Rate limiting (global) ----------
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 100 : 1000,
  message: "Too many requests from this IP",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// ---------- Compression ----------
app.use(compression());

// ---------- CORS ----------
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? process.env.ALLOWED_ORIGINS?.split(",") || []
    : [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
      ];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,
  })
);

// ---------- Body parsing + cookies ----------
app.use(
  express.json({
    limit: "10mb",
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.static("public"));
app.use(cookieParser());

// ---------- Health check ----------
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ---------- API routes ----------
app.use("/api/auth", authRouter);          // LOGIN / SIGNUP / REFRESH / LOGOUT
app.use("/api/snips", snipRoutes);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/channels", channelRouter);
app.use("/api/v1/notifications", notificationRouter);

// ---------- Root ----------
app.get("/", (req, res) => {
  res.json({
    message: "BharatWatch API",
    version: "1.0.0",
    status: "running",
  });
});

// ---------- 404 ----------
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ---------- Error handler (last) ----------
app.use(errorHandler);

export { app };
