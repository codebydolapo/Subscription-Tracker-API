import nodemailer from "nodemailer"
import { EMAIL_PASSWORD } from "./env"


const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "bashorun115@gmail.com",
        pass: EMAIL_PASSWORD
    }
})

export default transporter