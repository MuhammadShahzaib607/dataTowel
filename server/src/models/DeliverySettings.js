import mongoose from "mongoose";

const deliverySettingsSchema = new mongoose.Schema(
  {
    karachiCharge: {
      type: Number,
      default: 300,
      min: 0,
    },
    outsideKarachiCharge: {
      type: Number,
      default: 500,
      min: 0,
    },
  },
  { timestamps: true }
);

// Enforce single record
deliverySettingsSchema.index({}, { unique: true });

const DeliverySettings = mongoose.model("DeliverySettings", deliverySettingsSchema);

export default DeliverySettings;
