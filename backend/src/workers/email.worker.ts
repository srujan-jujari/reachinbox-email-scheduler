import { Worker } from "bullmq";
import { redisConnection } from "../config/redis";
import { prisma } from "../config/prisma";
import { sendEmail } from "../services/smtp.service";
import { checkRateLimit } from "../services/rateLimit.service";
import { emailQueue } from "../queues/email.queue";

const worker = new Worker(
  "emailQueue",

  async (job) => {
    console.log(`Processing job ${job.id}`);

    const { emailId, hourlyLimit } = job.data;

    const email = await prisma.email.findUnique({
      where: { id: emailId },
    });

    if (!email) {
      throw new Error(`Email ${emailId} not found`);
    }

    if (email.status === "sent") {
      console.log(`Email ${emailId} already sent. Skipping.`);
      return;
    }

    // Dynamic rate limit check per job settings
    const rateLimit = await checkRateLimit("default-sender", hourlyLimit || 10);

    if (!rateLimit.allowed) {
      console.log(`Hourly limit reached. Rescheduling email ${emailId}`);

      const delay = rateLimit.retryAt!.getTime() - Date.now();

      await emailQueue.add(
        "send-email",
        { emailId, hourlyLimit },
        {
          delay: Math.max(delay, 1000),
          jobId: `retry-${emailId}-${Date.now()}`,
        }
      );

      return { delayed: true, reason: "RATE_LIMIT_EXCEEDED" };
    }

    await prisma.email.update({
      where: { id: emailId },
      data: {
        status: "processing",
        attempts: { increment: 1 },
      },
    });

    try {
      await sendEmail(email.recipient, email.subject, email.body);

      await prisma.email.update({
        where: { id: emailId },
        data: {
          status: "sent",
          sentAt: new Date(),
        },
      });

      console.log(`Email ${emailId} successfully sent to ${email.recipient}`);

      return { success: true, emailId };
    } catch (error) {
      await prisma.email.update({
        where: { id: emailId },
        data: { status: "failed" },
      });

      throw error;
    }
  },

  {
    connection: redisConnection,
    concurrency: Number(process.env.WORKER_CONCURRENCY) || 5,
  }
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, error) => {
  console.error(`Job ${job?.id} failed:`, error.message);
});

console.log("Email worker started");