import nodemailer from "nodemailer";

import dotenv from 'dotenv';
dotenv.config();
// Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to send email based on form type
async function sendEmail(data, subject, formType) {
  let body = "";

  switch (formType) {
    case "customer":
      body = `
        Customer Details:
        Name: ${data.name}
        Email: ${data.email}
        Phone: ${data.phone}
        Comments: ${data.comments}
      `;
      break;
    case "business":
      body = `
        Business Details:
        Business Name: ${data.businessName}
        Business Email: ${data.businessEmail}
        Business Phone: ${data.businessPhone}
        Business Category: ${data.businessCategory}
      `;
      break;
    case "cp":
      body = `
        CP Details:
        CP Name: ${data.cpname}
        CP Email: ${data.cpemail}
        CP Mobile Number: ${data.cpmobilenumber}
        CP Message: ${data.cpmessage}
      `;
      break;
    default:
      body = "Unknown form type";
      break;
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: "mirmubasheer558@gmail.com", // or any other recipient
    subject: subject,
    text: body,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

export default sendEmail;
