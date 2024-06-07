require("dotenv").config();
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

const businessSchema = new mongoose.Schema({
  businessName: String,
  businessCategory: String,
  businessEmail: String,
  businessPhone: String,
});

const Business = mongoose.model("Business", businessSchema);

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

module.exports = async (req, res) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    const { businessCategory } = req.body;
    let businessData = req.body;

    if (businessCategory === "Other") {
      const { businessName, businessEmail, businessPhone, otherCategory } = req.body;
      businessData = {
        businessName,
        businessEmail,
        businessPhone,
        businessCategory: otherCategory
      };
    }

    const business = new Business(businessData);
    const businessDoc = await business.save();

    const emailBody = `
      Business Details:
      Business Name: ${businessData.businessName}
      Business Email: ${businessData.businessEmail}
      Business Phone: ${businessData.businessPhone}
      Business Category: ${businessData.businessCategory}
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: ["info@dprprop.com", "mirmubasheer558@gmail.com"],
      subject: "New Business Form Submission",
      text: emailBody,
    });

    res.status(200).json({ message: "Business data saved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    mongoose.connection.close();
  }
};
