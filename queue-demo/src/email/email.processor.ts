import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq"
import * as nodemailer from "nodemailer"
import configuration from "src/config/configuration";
import { generateFFPEmail } from "./email.helper";

@Processor("email")
export class EmailProcessor extends WorkerHost {
    private transporter: nodemailer.Transporter;
    private readonly config = configuration();

    constructor() {
        super();
        this.transporter = nodemailer.createTransport({
            host: this.config.email.smtpHost,
            port: this.config.email.smtpPort,
            secure: this.config.email.smtpPort === 465,
            auth: {
                user: this.config.email.smtpUser,
                pass: this.config.email.smtpPassword,
            },
            connectionTimeout: 5000,
            socketTimeout: 5000,
        });
    }

    async process(job: Job): Promise<any> {
        try {
            const { to, subject, html, text, name } = job.data;
            
            if (!to || !subject) {
                throw new Error("Invalid email job: missing to or subject");
            }


            // Use FFP template if no custom HTML provided
            const emailHtml =  generateFFPEmail(name) || html;

            const mailOptions = {
                from: this.config.email.smtpFrom,
                to,
                subject,
                html: emailHtml,
                text: text || undefined,
                replyTo: this.config.email.smtpFrom,
            };

            const result = await this.transporter.sendMail(mailOptions);
            
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error(`Email job ${job.id} failed:`, error.message);
            throw error;
        }
    }
}