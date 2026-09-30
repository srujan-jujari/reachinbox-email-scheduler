import dotenv from "dotenv";

dotenv.config();

import express from "express";
import cors from "cors";

import { emailQueue } from "./queues/email.queue";
import { prisma } from "./config/prisma";
import emailRoutes from "./routes/email.routes";

import "./workers/email.worker";

import { serverAdapter } from "./config/bull-board";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/emails", emailRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "ReachInbox Email Scheduler API is running 🚀",
  });
});

app.get("/test-db", async (req, res) => {
  const count = await prisma.email.count();

  res.json({
    message: "Database connection working",
    emailCount: count,
  });
});

// app.post("/test-job", async (req, res) => {
//   const job = await emailQueue.add(
//     "test-email",
//     {
//       message: "Hello from BullMQ!",
//     },
//     {
//       delay: 5000,
//     }
//   );

//   res.json({
//     message: "Job added successfully",
//     jobId: job.id,
//   });
// });

const PORT = process.env.PORT || 5000;

app.use(
  "/admin/queues",
  serverAdapter.getRouter()
);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});