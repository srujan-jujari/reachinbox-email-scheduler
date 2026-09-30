import { Router } from "express";

import {
  scheduleEmails,
  getEmails,
} from "../controllers/email.controller";

const router = Router();

router.post("/schedule", scheduleEmails);

router.get("/", getEmails);

export default router;