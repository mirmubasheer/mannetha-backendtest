import mongoose from 'mongoose';

// Define the customer schema
const customerSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  comments: String,
});

const CustomerModel = mongoose.model("Customer", customerSchema)

export { CustomerModel as Customer }
