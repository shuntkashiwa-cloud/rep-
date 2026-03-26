import type { VercelRequest, VercelResponse } from '@vercel/node'
import nodemailer from "nodemailer";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { to, subject, text, fileName, fileContent } = req.body as {
      to: string;
      subject: string;
      text: string;
      fileName?: string;
      fileContent?: string;
    };

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAI_ADR,
        pass: process.env.APP_PASS,
      },
    });

    const mailOptions: nodemailer.SendMailOptions = {
      from: process.env.GMAI_ADR,
      to,
      subject,
      text,
    };

    if (fileName && fileContent) {
      mailOptions.attachments = [
        {
          filename: fileName,
          content: Buffer.from(fileContent, "base64"),
        },
      ];
    }

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Mail sent successfully!" });
  } catch (error: any) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
}