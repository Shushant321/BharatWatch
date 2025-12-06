import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,                 // ✅ env se
    port: Number(process.env.SMTP_PORT),         // ✅ env se
    secure: false,                               // 587 => false
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_SENDER,
    to,
    subject,
    text,
  });
};
