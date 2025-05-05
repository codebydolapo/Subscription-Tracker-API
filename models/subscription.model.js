import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "User name is required"],
        trim: true,
        minLength: 2,
        maxLength: 100
    },
    price: {
        type: String,
        required: [true, "User email is required"],
        minLength: [0, "Price must be greater than 0"],
    },
    currency: {
        type: String,
        enum: ["USD", "EUR", "GBP"],
        default: "USD",
    },
    frequency: {
        type: String,
        enum: ["daily", "weekly", "monthly", "yearly"],
        default: "USD",
    },
    category: {
        type: String,
        enum: ["sports", "news", "entertainment", "lifestyle", "technology", "politics", "finance", "other"],
        required: true,
    },
    paymentMethod: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ["active", "cancelled", "expired"],
        default: "active"
    },
    startDate: {
        type: Date,
        required: true,
        validate: {
            validator: function (value) {
                return value <= new Date()
            },
            message: "start date must be in the past"
        }
    },
    renewalDate: {
        type: Date,
        required: true,
        validate: {
            validator: function (value) {
                return value >= this.startDate
            },
            message: "renewal date must be after the start date"
        }
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    }


}, { timestamps: true });

const Subscription = mongoose.model("Subscription", subscriptionSchema)

//auto-calculate renewal date if missing
subscriptionSchema.pre("save", function (next) {
    if (!this.renewalDate) {
        const renewalPeriods = {
            daily: 1,
            weekly: 7,
            monthly: 30,
            weekly: 365
        }
        this.renewalDate = new Date (this.startDate)
        this.renewalDate.setDate(this.renewalDate + renewalPeriods[this.frequency])
    }
    //auto update status if renewal date has passed
    if(this.renewalDate < new Date()){
        this.status = "expired"
    }
    
    next()
})


export default Subscription;