import mongoose from "mongoose"
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/env.js";

export const signUp = async (req, res, next) => {
    const session = await mongoose.startSession(); // Await the start of the session
    session.startTransaction();

    try {
        const { name, email, password } = req.body;

        // Check if a user already exists
        const existingUser = await User.findOne({ email }); // Await the promise

        if (existingUser) {
            const error = new Error("User already exists");
            // Attach statusCode property to the error object
            error.statusCode = 409;
            throw error;
        }

        // If the user doesn't exist, we hash the password for the user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt); // Use bcrypt.hash

        const newUsers = await User.create([{ name, email, password: hashedPassword }], { session });
        const token = jwt.sign({ userId: newUsers[0]._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        await session.commitTransaction();
        await session.endSession(); // Await the end of the session in the try block

        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: {
                token,
                user: newUsers[0],
            },
        });
    } catch (error) {
        await session.abortTransaction();
        await session.endSession();
        next(error);
    }
}

export const signIn = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Find the user by email
        const user = await User.findOne({ email }).select("+password"); // Explicitly select the password

        if (!user) {
            const error = new Error("Invalid credentials"); // More generic error message
            error.statusCode = 401; // Use 401 Unauthorized for login failures
            throw error;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            const error = new Error("Invalid credentials"); // Consistent error message
            error.statusCode = 401;
            throw error;
        }

        // If valid, we generate a new token
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        res.status(200).json({ // Use 200 OK for successful sign-in
            success: true,
            message: "Sign in successful", // More appropriate message
            data: {
                token,
                user: { _id: user._id, name: user.name, email: user.email }, // Send back relevant user info (excluding password)
            },
        });
    } catch (error) {
        next(error);
    }
};

export const signOut = async (req, res, next) => {

}