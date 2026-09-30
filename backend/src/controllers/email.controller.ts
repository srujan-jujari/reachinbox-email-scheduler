import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { emailQueue } from "../queues/email.queue";

export const scheduleEmails = async (req: Request, res: Response) => {
  try {
    const { subject, body, recipients, startTime, delay, hourlyLimit } = req.body;

    if (!subject || !body || !Array.isArray(recipients) || recipients.length === 0 || !startTime) {
      return res.status(400).json({
        message: "subject, body, recipients, and startTime are required",
      });
    }

    const scheduledAt = new Date(startTime);
    if (isNaN(scheduledAt.getTime())) {
      return res.status(400).json({ message: "Invalid startTime" });
    }

    // Convert UI delay seconds to milliseconds (defaults to 2000ms if empty)
    const emailDelayMs = (Number(delay) || 2) * 1000;
    const campaignHourlyLimit = Number(hourlyLimit) || 10;

    const createdEmails = [];

    for (let i = 0; i < recipients.length; i++) {
      const recipientScheduledAt = new Date(scheduledAt.getTime() + i * emailDelayMs);

      const email = await prisma.email.create({
        data: {
          recipient: recipients[i],
          subject,
          body,
          scheduledAt: recipientScheduledAt,
          status: "scheduled",
        },
      });

      const initialDelay = Math.max(0, recipientScheduledAt.getTime() - Date.now());

      await emailQueue.add(
        "send-email",
        {
          emailId: email.id,
          hourlyLimit: campaignHourlyLimit,
        },
        {
          delay: initialDelay,
          jobId: `email-${email.id}`,
        }
      );

      createdEmails.push(email);
    }

    return res.status(201).json({
      message: "Emails scheduled successfully",
      count: createdEmails.length,
      emails: createdEmails,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to schedule emails" });
  }
};

export const getEmails = async (req: Request, res: Response) => {
  try {
    const emails = await prisma.email.findMany({
      orderBy: { scheduledAt: "asc" },
    });
    return res.json({ emails });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch emails" });
  }
};