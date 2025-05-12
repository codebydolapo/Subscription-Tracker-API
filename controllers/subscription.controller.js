import { workflowClient } from "../config/upstash.js"; // Import the workflowClient (presumably for Upstash integration).
import Subscription from "../models/subscription.model.js"; // Import the Subscription model.
import { SERVER_URL } from "../config/env.js"; // Import the SERVER_URL from environment variables.


export const createSubscription = async (req, res, next) => {
    try {
        // Create a new subscription using data from the request body and the authenticated user.
        const subscription = await Subscription.create({
            ...req.body, // Spread the properties from the request body.
            user: req.user._id, // Assign the ID of the authenticated user to the 'user' field of the subscription.  This establishes the relationship between the subscription and the user.
        });

        // Trigger a workflow using workflowClient.  The purpose of this workflow is not clear from the code, but it's likely an asynchronous task related to the subscription creation (e.g., sending a welcome email, updating an external system).
        await workflowClient.trigger({
            url: `${SERVER_URL}`, //  Use the SERVER_URL, presumably the URL of the workflow endpoint.
        });

        // Send a 201 Created response with the subscription data.  201 is the appropriate status code for successful resource creation.
        res.status(201).json({ success: true, data: subscription });
    } catch (error) {
        // Handle any errors that occur during the subscription creation or workflow triggering.  Pass the error to the next middleware (usually your error handling middleware).
        next(error);
    }
};

export const getUserSubscriptions = async (req, res, next) => {
    try {
        // Authorization check:  Ensure that the user making the request is the owner of the account for which the subscriptions are being requested.
        if (req.user.id !== req.params._id) {
            const error = new Error("You are not the owner of this account");
            error.status(401); // Use 401 Unauthorized for authorization errors.
            throw error; // Throw the error to be caught by the catch block.
        }

        // Find all subscriptions for the specified user.  `req.params._id` is used to get the user ID from the URL.
        const subscriptions = await Subscription.find({ user: req.params._id });

        // Send a 200 OK response with the array of subscriptions.
        res.status(200).json({ success: true, data: subscriptions });
    } catch (error) {
        // Handle any errors.
        next(error);
    }
};

export const getAllSubscriptions = async (req, res, next) => {
    try {
        // Find all subscriptions in the database.
        const subscriptions = await Subscription.find();
        res.status(200).json({ success: true, data: subscriptions });
    } catch (error) {
        next(error);
    }
};

export const getParticularSubscription = async (req, res, next) => {
    try {
        // Find a subscription by its ID.  `req.params.id` is used to get the subscription ID from the URL.
        const subscription = await Subscription.findById(req.params.id);

        if (!subscription) {
            const error = new Error("Subscription not found");
            error.statusCode = 404; // Use 404 Not Found for the case where the subscription does not exist.
            throw error;
        }

        res.status(200).json({ success: true, data: subscription });
    } catch (error) {
        next(error);
    }
};
