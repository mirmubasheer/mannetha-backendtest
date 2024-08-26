import express from "express";
import { Customer } from "../models/Customer.js";
import sendEmail from '../utils/sendEmail.js';

const router = express.Router();


router.post("/customer", async (req, res) => {
  try {
    const { name, email, phone, comments } = req.body;
    const customer = new Customer({ name, email, phone, comments });
    await customer.save();

    // Send an email notification
    await sendEmail({ name, email, phone, comments }, "New Customer Submission", "customer");

    res.status(200).json({ message: "Customer saved and email sent" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export { router as customerRoutes };
