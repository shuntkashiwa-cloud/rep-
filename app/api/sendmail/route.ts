import { NextResponse } from 'next/server';
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  const { to, subject, text, fileName, fileContent } = await req.json();

  if (!to || !subject || !text) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
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
    return NextResponse.json({ message: "Mail sent successfully!" });
  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}