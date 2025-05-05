import { Router } from "express";
import { signIn, signOut, signUp } from "../controllers.js/auth.controller.js";

const authRouter = Router()


//the second parameters of these post requests are hooked up to controllers
authRouter.post("/sign-up", signUp)

authRouter.post("/sign-in", signIn)

authRouter.post("/sign-out", signOut)

export default authRouter;