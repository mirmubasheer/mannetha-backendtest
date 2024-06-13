require("dotenv").config();
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const cors = require("cors");

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

// Connect to MongoDB when the application starts
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1); // Exit the application if MongoDB connection fails
  });

// CORS middleware configuration
const corsOptions = {
  origin: 'https://dprprop.com',
  methods: 'POST,OPTIONS',
  allowedHeaders: ['Content-Type'],
  credentials: true,
  optionsSuccessStatus: 200
};

const corsMiddleware = cors(corsOptions);

module.exports = async (req, res) => {
  // Apply CORS middleware
  corsMiddleware(req, res, async () => {
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

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
  });
};
