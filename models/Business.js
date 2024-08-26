import mongoose from 'mongoose';

// Define the Business schema
const businessSchema = new mongoose.Schema({
  businessName: String,
  businessCategory: String,
  businessEmail: String,
  businessPhone: String,
});

// Create the Business model from the schema
const BusinessModel = mongoose.model("Business", businessSchema)

export {BusinessModel as Business}
