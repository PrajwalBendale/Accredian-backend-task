// server.js
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const nodemailer = require("nodemailer");

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

app.post("/referral", async (req, res) => {
  const { referrerName, referrerEmail, refereeName, refereeEmail, course } =
    req.body;

  if (
    !referrerName ||
    !referrerEmail ||
    !refereeName ||
    !refereeEmail ||
    !course
  ) {
    return res.status(400).send({ error: "All fields are required" });
  }

  try {
    const referral = await prisma.referral.create({
      data: {
        referrerName,
        referrerEmail,
        refereeName,
        refereeEmail,
        course,
      },
    });

    // Send referral email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: "your-email@gmail.com",
      to: refereeEmail,
      subject: "Referral Notification",
      text: `You have been referred to the course: ${course} by ${referrerName}.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).send({ error: "Failed to send email" });
      }
      res.status(200).send({ message: "Referral submitted successfully" });
    });
  } catch (error) {
    res.status(500).send({ error: "Failed to save referral" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
