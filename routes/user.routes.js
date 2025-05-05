import { Router } from "express";

const userRouter = Router()

userRouter.get("/", (req, res)=>{
    res.send({title: "GET all users"})
})

userRouter.get("/:id", (req, res)=>{
    res.send({title: "GET user details"})
})

userRouter.post("/", (req, res)=>{
    res.send({title: "CREATE new user"})
})

userRouter.put("/:id", (req, res)=>{
    res.send({title: "UPDATE a user"})
})

userRouter.delete("/:id", (req, res)=>{
    res.send({title: "DELETE a certain user"})
})

export default userRouter