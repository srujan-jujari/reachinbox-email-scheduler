import { redisConnection } from "../config/redis";

export async function checkRateLimit(sender: string, maxPerHour: number) {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  const hour = String(now.getUTCHours()).padStart(2, "0");

  const windowKey = `email-rate:${sender}:${year}${month}${day}${hour}`;
  const count = await redisConnection.incr(windowKey);

  if (count === 1) {
    await redisConnection.expire(windowKey, 60 * 60 + 60);
  }

  if (count > maxPerHour) {
    return {
      allowed: false,
      retryAt: getNextHour(),
    };
  }

  return {
    allowed: true,
    retryAt: null,
  };
}

function getNextHour() {
  const nextHour = new Date();
  nextHour.setUTCMinutes(0);
  nextHour.setUTCSeconds(0);
  nextHour.setUTCMilliseconds(0);
  nextHour.setUTCHours(nextHour.getUTCHours() + 1);
  return nextHour;
}