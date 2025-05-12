import mongoose from "mongoose";
import User from "../models/user.model.js"; // Import the User model.
import bcrypt from "bcryptjs"; // Import bcrypt for password hashing.
import jwt from "jsonwebtoken"; // Import jsonwebtoken for creating JWTs.
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/env.js"; // Import JWT configuration from environment variables.


export const signUp = async (req, res, next) => {
    const session = await mongoose.startSession(); // Start a Mongoose session for transactional operations.
    session.startTransaction(); // Start a transaction within the session.

    try {
        const { name, email, password } = req.body; // Extract user data from the request body.

        // Check if a user with the given email already exists.
        const existingUser = await User.findOne({ email }); // Await the promise returned by findOne().

        if (existingUser) {
            const error = new Error("User already exists");
            error.statusCode = 409; // Use 409 Conflict for duplicate resource creation.
            throw error;
        }

        // Hash the user's password before storing it in the database.
        const salt = await bcrypt.genSalt(10); // Generate a salt for bcrypt.
        const hashedPassword = await bcrypt.hash(password, salt); // Hash the password using the generated salt.

        // Create the new user in the database within the transaction.  The `session` option ensures this operation is part of the transaction.
        const newUsers = await User.create([{ name, email, password: hashedPassword }], { session }); // Await the promise

        // Generate a JSON Web Token (JWT) for the newly created user.
        const token = jwt.sign({ userId: newUsers[0]._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        await session.commitTransaction(); // Commit the transaction, making the user creation permanent.  Await the promise.
        await session.endSession();       // End the session.  Await the promise.

        // Send a 201 Created response with the user data and the JWT.  We only send back the first element of the newUsers array.
        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: {
                token,
                user: newUsers[0], // Send the first user created
            },
        });
    } catch (error) {
        // If any error occurs during the process, abort the transaction.  This ensures that no partial user data is saved.
        await session.abortTransaction();
        await session.endSession(); // End the session.  Important to do this in the catch block as well.
        next(error); // Pass the error to the next middleware (usually your error handler).
    }
};


export const signIn = async (req, res, next) => {
    try {
        const { email, password } = req.body; // Extract email and password from the request body.

        // Find the user by email.  We need to explicitly select the password field because, by default, Mongoose might exclude it for security reasons.
        const user = await User.findOne({ email }).select("+password"); // Await the promise.

        if (!user) {
            const error = new Error("Invalid credentials"); // Use a more generic error message.
            error.statusCode = 401; // Use 401 Unauthorized for login failures.
            throw error; // Throw the error.
        }

        // Compare the provided password with the hashed password stored in the database.
        const isPasswordValid = await bcrypt.compare(password, user.password); // Await the promise.

        if (!isPasswordValid) {
            const error = new Error("Invalid credentials"); // Consistent error message.
            error.statusCode = 401;
            throw error;
        }

        // If the email and password are valid, generate a JWT.
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        // Send a 200 OK response with the JWT and selected user data (excluding the password).
        res.status(200).json({ // Use 200 OK for successful login.
            success: true,
            message: "Sign in successful", // More appropriate message.
            data: {
                token,
                user: { _id: user._id, name: user.name, email: user.email }, //  Send only the necessary user information.  Never send the password.
            },
        });
    } catch (error) {
        next(error); // Pass the error to the error handling middleware.
    }
};


export const signOut = async (req, res, next) => {
    //  * TODO: Implement sign-out functionality.  This might involve:
    //  * -  Clearing the JWT from the client-side (e.g., deleting a cookie).
    //  * -  Potentially invalidating the token on the server (if you're using a more complex token management strategy).
    //  * For a simple sign-out, often, no server-side action is required beyond clearing the client's token.
    //  * Example (Conceptual):
    //  * res.clearCookie('token'); //  If using cookies.
    //  * res.status(200).json({ success: true, message: "Signed out" });
    //  * next();
};
