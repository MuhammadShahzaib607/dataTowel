import mongoose from "mongoose";

const bankDetailsSchema = new mongoose.Schema(
  {
    accountTitle: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },
    bankName: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },
    accountNumber: {
      type: String,
      trim: true,
      maxlength: 50,
      default: "",
    },
    iban: {
      type: String,
      trim: true,
      maxlength: 50,
      default: "",
    },
  },
  { timestamps: true }
);

// Enforce single record: only one bank details document allowed
bankDetailsSchema.index({}, { unique: true });

const BankDetails = mongoose.model("BankDetails", bankDetailsSchema);

export default BankDetails;
