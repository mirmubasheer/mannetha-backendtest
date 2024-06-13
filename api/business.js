require("dotenv").config();
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

// Define the business schema and model
const businessSchema = new mongoose.Schema({
  businessName: String,
  businessCategory: String,
  businessEmail: String,
  businessPhone: String,
});

const Business = mongoose.model("Business", businessSchema);

// Create a transporter for nodemailer
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Connect to MongoDB when the application starts
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1); // Exit the application if MongoDB connection fails
  });

module.exports = async (req, res) => {
  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', 'https://dprprop.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Handle POST request
  if (req.method === 'POST') {
    try {
      const { businessCategory, businessName, businessEmail, businessPhone, otherCategory } = req.body;

      const businessData = businessCategory === "Other"
        ? { businessName, businessEmail, businessPhone, businessCategory: otherCategory }
        : { businessName, businessEmail, businessPhone, businessCategory };

      const business = new Business(businessData);
      await business.save();

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
      console.error("Internal server error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
