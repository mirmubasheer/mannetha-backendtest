import mongoose from 'mongoose';

// Define the CP schema
const cpSchema = new mongoose.Schema({
  cpname: { type: String, required: true },
  cpmessage: String,
  cpemail: String,
  cpmobilenumber: String,
});

const CpModel = mongoose.model("Cp", cpSchema)

export {CpModel as Cp}
