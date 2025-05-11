import { Router } from "express";
import authorize from "../middleware/auth.middleware.js";
import { createSubscription, getAllSubscriptions, getParticularSubscription, getUserSubscriptions } from "../controllers/subscription.controller.js";

const subscriptionRouter = Router()

subscriptionRouter.get("/", getAllSubscriptions)

subscriptionRouter.get("/:id", authorize, getParticularSubscription)

subscriptionRouter.post("/", authorize, createSubscription)

subscriptionRouter.get("/user/:id", authorize, getUserSubscriptions)

subscriptionRouter.put("/:id", (req, res)=>{
    res.send({title: "UPDATE a subscription"})
})

subscriptionRouter.delete("/:id", (req, res)=>{
    res.send({title: "DELETE a subscription"})
})

subscriptionRouter.get("/user/:id", (req, res)=>{
    res.send({title: "DELETE all user subscriptions"})
})

subscriptionRouter.put("/:id/cancel", (req, res)=>{
    res.send({title: "CANCEL a subscription"})
})

subscriptionRouter.get("/upcoming-renewals", (req, res)=>{
    res.send({title: "GET upcoming renewals"})
})

export default subscriptionRouter