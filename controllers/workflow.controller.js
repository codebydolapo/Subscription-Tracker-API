import { createRequire } from "module"; // Import createRequire to use require in ES module.
import Subscription from "../models/subscription.model.js"; // Import the Subscription model.
const require = createRequire(import.meta.url); //  Define require for use in the current module.
const { serve } = require("@upstash/workflow/express"); // Import the 'serve' function from the Upstash workflow library.
import dayjs from "dayjs"; // Import dayjs for date manipulation.
import { sendReminderEmail } from "../utils/send-email.js"; // Import the sendReminderEmail function.

// Define an array of reminder days (days before renewal).
const REMINDERS = [7, 5, 3, 1];

export const sendReminders = serve(async (context) => {
    // Extract the subscription ID from the workflow's input payload.
    const { subscriptionId } = context.requestPayload;

    // Fetch the subscription details, including the associated user's name and email.
    const subscription = await fetchSubscription(context, subscriptionId);

    // If the subscription is not found or is not active, stop the workflow.
    if (!subscription || subscription.status !== "active") {
        console.log(
            `renewal date has passed for subscription ${subscriptionId}. Stopping Workflow`
        );
        return; // Exit the workflow.
    }

    const renewalDate = dayjs(subscription.renewalDate); // Convert the renewal date to a dayjs object for easier manipulation.

    // If the renewal date is in the past, stop the workflow.
    if (renewalDate.isBefore(dayjs())) {
        console.log(
            `renewal date has passed for subscription ${subscriptionId}. Stopping Workflow`
        );
        return; // Exit the workflow.
    }

    // Iterate through the reminder days.
    for (const daysBefore of REMINDERS) {
        const reminderDate = renewalDate.subtract(daysBefore, "day"); // Calculate the date for each reminder.

        // If the reminder date is in the future, schedule a sleep until that date.
        if (reminderDate.isAfter(dayjs())) {
            await sleepUntilReminder(
                context,
                `Reminder ${daysBefore} days before`,
                reminderDate
            );
        }

        // If today is the reminder date, trigger the reminder.
        if (dayjs().isSame(reminderDate, "day")) {
            await triggerReminder(
                context,
                `${daysBefore} days before reminder`,
                subscription
            );
        }
    }
});

const fetchSubscription = async (context, subscriptionId) => {
    // Use context.run to execute an asynchronous function as a named step in the workflow.
    return await context.run("Get Subscription", async () => {
        // Find the subscription by ID and populate the 'user' field with the user's name and email.
        return Subscription.findById(subscriptionId).populate(
            "user",
            "name email"
        );
    });
};


const sleepUntilReminder = async (context, label, date) => {
    console.log(`sleeping until ${label} reminder is at ${date}`);
    // Use context.sleepUntil to pause the workflow until the specified date.  The date needs to be a JS Date object.
    await context.sleepUntil(label, date.toDate());
};


const triggerReminder = async (context, label, subscription) => {
    // Use context.run to execute an asynchronous function as a named step.
    return await context.run(label, async () => {
        console.log(`triggering ${label} reminder`);
        // Send the reminder email using the sendReminderEmail utility function.
        await sendReminderEmail({
            to: subscription.user.email, //  The recipient's email address.
            type: label, // The type of reminder (e.g., "7 days before").
            subscription, // The subscription object.
        });
    });
};
