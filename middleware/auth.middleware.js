import jwt from "jsonwebtoken"; // Import the jsonwebtoken library for JWT verification.
import { JWT_SECRET } from "../config/env.js"; // Import the JWT secret from your environment configuration.
import User from "../models/user.model.js"; // Import the User model.

// * Middleware: authorize
// * Description:  Express middleware for authorizing users based on JWT tokens.
const authorize = async (req, res, next) => {
    try {
        let token; // Declare a variable to store the JWT token.

        // Check if the Authorization header is present and starts with "Bearer ".
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer ")
        ) {
            // Extract the token from the Authorization header.  The header format is expected to be "Bearer <token>".
            token = req.headers.authorization.split(" ")[1];
        }

        // If no token is found, return a 401 Unauthorized response.
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Verify the token using the JWT_SECRET.  This will decode the token and throw an error if the token is invalid (e.g., expired, wrong signature).
        const decoded = jwt.verify(token, JWT_SECRET);

        // Find the user associated with the decoded token's user ID.
        const user = await User.findById(decoded.userId);

        // If no user is found with the decoded ID, the token is invalid (e.g., user deleted), so return a 401 Unauthorized response.
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // If the token is valid and the user exists, attach the user object to the request object.  This makes the user data available to subsequent middleware and route handlers.
        req.user = user;

        // Call the next middleware function to continue processing the request.
        next();
    } catch (error) {
        // Handle any errors that occur during the token verification or user lookup process.  This includes invalid tokens, expired tokens, and database errors.
        //  -  It's important to handle errors here to prevent unhandled exceptions.
        res.status(401).json({
            success: false,
            message: "Unauthorized",
            error: error.message, // Include the error message from the JWT library for more detailed information.
        });
        next(error); // Pass the error to the next error handling middleware.  This allows for centralized error handling if needed.
    }
};

export default authorize; // Export the authorize middleware function so it can be used in your Express application.
