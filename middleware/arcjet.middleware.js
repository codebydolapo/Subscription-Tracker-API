import aj from "../config/arcjet.js"; // Import the Arcjet client.
import { isSpoofedBot } from "@arcjet/inspect"; // Import the isSpoofedBot function from the Arcjet inspect module.

// * Middleware: arcjetMiddleware
// * Description: Express middleware for protecting routes using Arcjet.  It checks for rate limiting, bot activity, and spoofed bots.
const arcjetMiddleware = async (req, res, next) => {
    try {
        // Protect the request using Arcjet.  Deduct 1 token from the associated bucket (likely for rate limiting).
        //  -  The 'requested: 1' option indicates the cost of this request in terms of tokens.
        const decision = await aj.protect(req, { requested: 1 });
        console.log("Arcjet decision", decision); // Log the Arcjet decision for debugging and monitoring.

        // Handle the Arcjet decision:
        if (decision.isDenied()) {
            // The request was denied by Arcjet.
            if (decision.reason.isRateLimit()) {
                // The request was denied due to rate limiting.
                res.status(429); // 429 Too Many Requests
                res.send({ success: false, error: "Too Many Requests" });
            } else if (decision.reason.isBot()) {
                // The request was denied because it was identified as a bot.
                res.status(403); // 403 Forbidden
                res.send({ success: false, error: "No bots allowed" });
            } else {
                // The request was denied for some other reason (general denial).
                res.status(403); // 403 Forbidden
                res.send({ success: false, error: "Forbidden" });
            }
            //  -  It's important to *not* call next() here, because the request should not proceed if it's denied.
        } else if (decision.results.some(isSpoofedBot)) {
            // Check if any of the Arcjet results indicate a spoofed bot.
            res.status(403); // 403 Forbidden
            res.send({ success: false, error: "Forbidden" });
            //  -  Again, do not call next() here.
        } else {
            // The request was allowed by Arcjet.
            res.status(200).send({ success: true }); //  Consider what you want to send back to the client here.  A 200 OK without data might not be correct in all situations.
            next(); // Call next() to pass the request to the next middleware or route handler.
        }
    } catch (error) {
        // Handle any errors that occur during the Arcjet protection process.
        console.log(`Arcjet Middleware Error: ${error}`); // Log the error.
        next(error); // Pass the error to the next error handling middleware.
    }
};

export default arcjetMiddleware; // Export the middleware.
