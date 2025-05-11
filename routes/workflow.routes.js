import { Router } from "express";
import { sendReminder } from "../controllers/workflow.controller";

const workflowRouter = Router()

workflowRouter.post("/subscription/reminder", sendReminders)

export default workflowRouter