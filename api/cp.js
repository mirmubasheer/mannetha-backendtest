require("dotenv").config();
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

const cpSchema = new mongoose.Schema({
  cpname: { type: String, required: true },
  cpaddress: String,
  cpemail: String,
  cpmobilenumber: String,
});

const Cp = mongoose.model("Cp", cpSchema);

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

let isConnected;

async function connectToDatabase() {
  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    try {
      await connectToDatabase();

      const cp = new Cp(req.body);
      const cpDoc = await cp.save();

      const emailBody = `
        CP Details:
        CP Name: ${req.body.cpname}
        CP Email: ${req.body.cpemail}
        CP Mobile Number: ${req.body.cpmobilenumber}
        CP Address: ${req.body.cpaddress}
      `;

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: ["info@dprprop.com", "mirmubasheer558@gmail.com"],
        subject: "New CP Form Submission",
        text: emailBody,
      });

      res.status(200).json({ message: "CP data saved successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    } finally {
      mongoose.connection.close();
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
