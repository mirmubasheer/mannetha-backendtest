require("dotenv").config();
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

// Define the customer schema and model
const customerSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  address: String,
});

const Customer = mongoose.model("Customer", customerSchema);

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
      const { name, email, phone, address } = req.body;

      const customerData = { name, email, phone, address };

      const customer = new Customer(customerData);
      await customer.save();

      const emailBody = `
        Customer Details:
        Name: ${customerData.name}
        Email: ${customerData.email}
        Phone: ${customerData.phone}
        Address: ${customerData.address}
      `;

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: ["info@dprprop.com", "mirmubasheer558@gmail.com"],
        subject: "New Customer Form Submission",
        text: emailBody,
      });

      res.status(200).json({ message: "Customer data saved successfully" });
    } catch (err) {
      console.error("Internal server error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
