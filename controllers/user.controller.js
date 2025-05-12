import User from "../models/user.model.js"; // Import the User model.

export const getUsers = async (req, res, next) => {
    try {
        // Find all users in the database.
        const users = await User.find();
        // Send a 200 OK response with the array of users.
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        // Handle any errors that occur during the database query.
        next(error); // Pass the error to the next middleware (usually your error handling middleware).
    }
};

export const getUser = async (req, res, next) => {
    try {
        // Find a user by their ID.  The select("-password") method excludes the password field from the result for security reasons.
        const user = await User.findById(req.params.id).select("-password");

        // Check if a user with the provided ID exists.
        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404; // Use 404 Not Found to indicate that the user was not found.
            throw error; // Throw the error to be caught by the catch block.
        }

        // Send a 200 OK response with the user data.
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        // Handle any errors that occur during the database query or the "user not found" check.
        next(error); // Pass the error to the next middleware.
    }
};
