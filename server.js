// server.js

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

const app = express();
const PORT = 8080;

// Middleware
// const corsOptions = {
//   origin: 'https://dprprop.com',
//   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//   credentials: true,
//   optionsSuccessStatus: 204
// }
// app.use(cors(corsOptions));
// app.use(cors());

app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB connection error:", err));


// Schemas
const customerSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  address: String,
});

const businessSchema = new mongoose.Schema({
  businessName: String,
  businessCategory: String,
  businessEmail: String,
  businessPhone: String,
});

const cpSchema = new mongoose.Schema({
  cpname: { type: String, required: true },
  cpaddress: String,
  cpemail: String,
  cpmobilenumber: String,
});

// Models
const Cust = mongoose.model("Cust", customerSchema);
const Business = mongoose.model("Business", businessSchema);
const Cp = mongoose.model("Cp", cpSchema);

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
app.get("/new", (req, res) => {
  res.json("hello")
})
// Routes
app.post("/customer", async (req, res) => {
  try {
    const cust = new Cust(req.body);
    const custDoc = await cust.save();
    // console.log(custDoc)
    await sendEmail(req.body, "New Customer Form Submission", "customer");
    res.json({ cust: custDoc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/business", async (req, res) => {
  // try {
  //   const business = new Business(req.body);
  //   const businessDoc = await business.save();
  //   // console.log(businessDoc);
  //   await sendEmail(req.body, "New Business Form Submission", "business");
  //   res.json({ business: businessDoc });
  // } 
  try {
    const { businessCategory } = req.body;
    
    // Check if the business category is "Other"
    if (businessCategory === "Other") {
      // Handle "Other" category differently
      const { businessName, businessEmail, businessPhone, otherCategory } = req.body;
      const business = new Business({ businessName, businessEmail, businessPhone, businessCategory: otherCategory });
      const businessDoc = await business.save();
      await sendEmail({ ...req.body, businessCategory: otherCategory }, "New Business Form Submission", "business");
      res.json({ business: businessDoc });
    } else {
      // Handle predefined categories
      const business = new Business(req.body);
      const businessDoc = await business.save();
      await sendEmail(req.body, "New Business Form Submission", "business");
      res.json({ business: businessDoc });
    }
  } 
  catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/cp", async (req, res) => {
  try {
    const cp = new Cp(req.body);
    const cpDoc = await cp.save();
    // console.log(cpDoc);
    await sendEmail(req.body, "New CP Form Submission", "cp");
    res.json({ cp: cpDoc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

async function sendEmail(data, subject, formType) {
  let body = "";

  switch (formType) {
    case "customer":
      body = `
        Customer Details:
        Name: ${data.name}
        Email: ${data.email}
        Phone: ${data.phone}
        Address: ${data.address}
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
        CP Address: ${data.cpaddress}
      `;
      break;
    default:
      break;
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: ["info@dprprop.com", "mirmubasheer558@gmail.com"],
    subject: subject,
    text: body,
  };

  await transporter.sendMail(mailOptions);
  console.log("Email sent successfully");
}

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

