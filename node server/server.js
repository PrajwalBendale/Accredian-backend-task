// server.js
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const nodemailer = require("nodemailer");
const cors = require("cors");

const prisma = new PrismaClient({ log: ["query", "info", "warn", "error"] });
const app = express();
app.use(express.json());
app.use(cors());

app.post("/referral", async (req, res) => {
  console.log("post");
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
    console.log(referrerName);
    const referral = await prisma.referral.create({
      data: {
        referrerName,
        referrerEmail,
        refereeName,
        refereeEmail,
        course,
      },
    });
    //console.log(data);

    // Send referral email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: refereeEmail,
      subject: `Referral Notification for ${course} by ${referrerName}`,
      text: `Dear ${refereeName},

I hope this message finds you well. I wanted to reach out and recommend the Full Stack course offered by Accredian Tech. Having recently completed the program myself, I found it exceptionally insightful and valuable for advancing my skills in web development.

This course stands out for its hands-on approach and comprehensive curriculum covering everything from frontend technologies like React and Angular to backend frameworks like Node.js and Spring Boot. The instructors are highly knowledgeable and provide excellent support throughout the learning journey.

I believe this course would be a perfect fit for you, especially given your interest in ${course}. Feel free to reach out to AccredianTech or visit the course page for more details. I'm confident you'll find it as enriching as I did.

Best regards,
Accredian Tech`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).send({ error: "Failed to send email" });
      }
      res.status(200).send({ message: "Referral submitted successfully" });
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Failed to save referral" });
  }
});

app.get("/referral", (req, res) => {
  res.send("GET request to the referral-page");
});
const PORT = process.env.PORT || 3099;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
