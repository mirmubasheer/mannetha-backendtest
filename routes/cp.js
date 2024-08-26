import express from "express";
import { Cp } from "../models/Cp.js";
import sendEmail from "../utils/sendEmail.js";

const router = express.Router();

router.post("/cp", async (req, res) => {
  try {
    const { cpname, cpmessage, cpemail, cpmobilenumber } = req.body;
    
    // Create a new Cp instance with the request body
    const cp = new Cp({ cpname, cpmessage, cpemail, cpmobilenumber });
    const cpDoc = await cp.save();

    // Send an email notification
    await sendEmail(
      {
        cpname,
        cpmessage,
        cpemail,
        cpmobilenumber
      }, 
      "New CP Form Submission", 
      "cp"
    );

    // Respond with the saved Cp document
    res.status(200).json({ cp: cpDoc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export { router as cpRoutes };
