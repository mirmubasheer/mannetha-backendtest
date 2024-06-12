require("dotenv").config();
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const cors = require("cors");

// Define schema
const businessSchema = new mongoose.Schema({
  businessName: String,
  businessCategory: String,
  businessEmail: String,
  businessPhone: String,
});

// Define model
const Business = mongoose.model("Business", businessSchema);

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1); // Exit the application if MongoDB connection fails
  });

// CORS middleware configuration
const corsOptions = {
  origin: 'https://dprprop.com',
  methods: 'POST',
  allowedHeaders: ['Content-Type'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Apply CORS middleware
const corsMiddleware = cors(corsOptions);

// Main function to handle request
module.exports = async (req, res) => {
  corsMiddleware(req, res, async () => {
    if (req.method === 'POST') {
      try {
        console.log('Request body:', req.body);

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
        console.log('Business saved:', businessDoc);

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
        console.error('Error saving business:', err);
        res.status(500).json({ error: "Internal server error" });
      }
    } else {
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  });
};
