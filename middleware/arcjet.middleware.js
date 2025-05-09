import aj from "../config/arcjet.js"
import { isSpoofedBot } from "@arcjet/inspect";

const arcjetMiddleware = async (req, res, next) => {
    try {

        const decision = await aj.protect(req, { requested: 1 }); // Deduct 1 token from the bucket
        console.log("Arcjet decision", decision);

        if (decision.isDenied()) {
            if (decision.reason.isRateLimit()) {
                res.status(429);
                res.send({success: false, error: "Too Many Requests" });
            } else if (decision.reason.isBot()) {
                res.status(403);
                res.send({success: false, error: "No bots allowed" });
            } else {
                res.status(403);
                res.send({success: false, error: "Forbidden" });
            }
        } else if (decision.results.some(isSpoofedBot)) {
            res.status(403);
            res.send({ success: false, error: "Forbidden" });
        } else {
            res.status(200).send({success: true})
            next()
        }
    } catch (error) {
        console.log(`Arcjet Middleware Error: ${error}`)
        next(error)
    }
}

export default arcjetMiddleware  