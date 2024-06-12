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

const Business = mongoose.model("business", businessSchema);

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
  methods: 'POST',
  allowedHeaders: ['Content-Type'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Apply CORS middleware to your function
const corsMiddleware = cors(corsOptions);

module.exports = async (req, res) => {
  corsMiddleware(req, res, async () => {
    if (req.method === 'POST') {
      try {
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
      }
    } else {
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  });
};
