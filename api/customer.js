require("dotenv").config();
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const cors = require("cors");

const customerSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  address: String,
});

const Cust = mongoose.model("customer", customerSchema);

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
        const cust = new Cust(req.body);
        const custDoc = await cust.save();

        const emailBody = `
          Customer Details:
          Name: ${req.body.name}
          Email: ${req.body.email}
          Phone: ${req.body.phone}
          Address: ${req.body.address}
        `;

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: ["info@dprprop.com", "mirmubasheer558@gmail.com"],
          subject: "New Customer Form Submission",
          text: emailBody,
        });

        res.status(200).json({ message: "Customer data saved successfully" });
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
