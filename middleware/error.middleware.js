
const errorMiddleware = (err, req, res, next) => {
    try {
        // Create a shallow copy of the error object to avoid modifying the original error.
        let error = { ...err };
        // Ensure that the error object always has a message property.
        error.message = err.message;

        // Log the error to the console for debugging and monitoring.  Using console.error ensures that the error is logged as an error, which is helpful for filtering logs.
        console.error(err);

        // Handle specific Mongoose errors:

        // * CastError:  This error occurs when Mongoose fails to cast a value to a specified type (e.g., trying to use an invalid ID in a database query).
        if (err.name === "CastError") {
            const message = "Resource not found"; //  A more user-friendly message.
            error = new Error(message); // Create a new error object with the user-friendly message.
            error.statusCode = 404;     // Set the status code to 404 (Not Found).
        }

        // * 11000 Duplicate Key Error:  This error occurs when a duplicate key violation happens in the database (e.g., trying to create a user with an email that already exists).
        if (err.code === 11000) {
            const message = "Duplicate field value entered";
            error = new Error(message);
            error.statusCode = 400;     // Set the status code to 400 (Bad Request).
        }

        // * ValidationError:  This error occurs when Mongoose validation fails (e.g., a required field is missing, or a value doesn't match a specified pattern).
        if (err.name === "ValidationError") {
            // Extract the error messages from the `err.errors` object.  Mongoose validation errors are often contained within the `err.errors` object, which is an object.
            const message = Object.values(err.errors)
                .map((val) => val.message) // Get the message from each validation error object.
                .join(", ");             // Join the individual error messages into a single string, separated by commas.
            error = new Error(message); // Create a new error with combined messages.
            error.statusCode = 400;     // Set the status code to 400 (Bad Request).
        }

        // Send the error response to the client.
        //  - Use the provided err.statusCode if it exists; otherwise, default to 500 (Internal Server Error).
        //  -  Use the custom error.message if available; otherwise, use a generic "Server Error" message.
        res.status(error.statusCode || 500).json({
            success: false,
            error: error.message || "Server Error",
        });
    } catch (error) {
        // Catch any errors that occur within this middleware itself (e.g., if there's an error while handling the error).
        //  -  It's crucial to have this catch block to prevent unhandled exceptions.
        next(error); // Pass the error to the next error handling middleware (if any).  This allows for more general error handling if needed.
    }
};

export default errorMiddleware; // Export the errorMiddleware function so it can be used by the Express application.
