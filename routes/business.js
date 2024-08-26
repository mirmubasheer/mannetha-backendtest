import express from "express";
import { Business } from "../models/Business.js";
import sendEmail from "../utils/sendEmail.js";

const router = express.Router();

router.post("/business", async (req, res) => {
  try {
    const { businessName, businessCategory, businessEmail, businessPhone, otherCategory } = req.body;
    let businessData = {};

    // Check if the business category is "Other"
    if (businessCategory === "Other") {
      // Handle "Other" category differently
      businessData = {
        businessName,
        businessEmail,
        businessPhone,
        businessCategory: otherCategory
      };
    } else {
      // Handle predefined categories
      businessData = {
        businessName,
        businessCategory,
        businessEmail,
        businessPhone
      };
    }

    // Create and save the Business instance
    const business = new Business(businessData);
    const businessDoc = await business.save();

    // Send an email notification
    await sendEmail(
      {
        businessName,
        businessCategory: businessCategory === "Other" ? otherCategory : businessCategory,
        businessEmail,
        businessPhone
      }, 
      "New Business Form Submission", 
      "business"
    );

    res.status(200).json({ business: businessDoc });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export { router as businessRoutes };
