import express from "express";
import errorMiddleware from "./middleware/error.middleware.js";
import { PORT } from "./config/env.js";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import subscriptionRouter from "./routes/subscriptions.routes.js";
import connectToDatabase from "./database/mongodb.js";
import cookieParser from "cookie-parser";
import arcjetMiddleware from "./middleware/arcjet.middleware.js";
import workflowRouter from "./routes/workflow.routes.js";

const app = express();

// Middleware:
app.use(express.json()); // Parses incoming requests with JSON payloads. 
app.use(express.urlencoded({ extended: false })); // Parses incoming requests with URL-encoded payloads. 
app.use(cookieParser()); //  This is necessary for handling cookies.
app.use(arcjetMiddleware); // This is custom middleware for rate limiting.


// Routes:
// Mount the authentication routes at the `/api/v1/auth` path.  All routes defined in `authRouter` will be prefixed with this path.
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/workflows", workflowRouter);


// Error Handling Middleware:
//  - errorMiddleware:  This custom middleware is responsible for handling errors that occur during the request processing.
app.use(errorMiddleware);


// app.get("/", (req, res) => {
//     res.send("Hello World");
// });


app.listen(PORT, async () => {
    console.log(`App listening on port ${PORT}`);
    await connectToDatabase(); //  -  Connect to the MongoDB database.  
});

export default app;
